import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";

export interface ServiceInstance {
  id: string;
  url: string;
  weight: number;
  healthy: boolean;
  lastHealthCheck: Date;
  responseTime: number;
  activeConnections: number;
}

export type LoadBalancingStrategy =
  | "round-robin"
  | "least-connections"
  | "weighted"
  | "random";

@Injectable()
export class LoadBalancerService {
  private readonly logger = new Logger(LoadBalancerService.name);
  private readonly serviceInstances: Map<string, ServiceInstance[]> = new Map();
  private readonly roundRobinCounters: Map<string, number> = new Map();
  private readonly strategy: LoadBalancingStrategy;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.strategy = this.configService.get<LoadBalancingStrategy>(
      "gateway.loadBalancing.strategy",
      "round-robin"
    );
    this.initializeServiceInstances();
  }

  private initializeServiceInstances(): void {
    const microservices = this.configService.get("gateway.microservices", {});

    Object.entries(microservices).forEach(
      ([serviceName, config]: [string, any]) => {
        const instances: ServiceInstance[] = [];

        // For now, we'll use single instances, but this can be extended for multiple replicas
        const instance: ServiceInstance = {
          id: `${serviceName}-1`,
          url: config.url,
          weight: config.weight || 1,
          healthy: true,
          lastHealthCheck: new Date(),
          responseTime: 0,
          activeConnections: 0,
        };

        instances.push(instance);
        this.serviceInstances.set(serviceName, instances);
        this.roundRobinCounters.set(serviceName, 0);
      }
    );

    this.logger.log(
      `Initialized load balancer with ${this.serviceInstances.size} services`
    );
  }

  public async getServiceUrl(serviceName: string): Promise<string> {
    const instances = this.serviceInstances.get(serviceName);

    if (!instances || instances.length === 0) {
      throw new Error(`No instances available for service: ${serviceName}`);
    }

    const healthyInstances = instances.filter((instance) => instance.healthy);

    if (healthyInstances.length === 0) {
      this.logger.warn(
        `No healthy instances for service: ${serviceName}, using unhealthy instances`
      );
      // Fallback to unhealthy instances in emergency
      const selectedInstance = this.selectInstance(serviceName, instances);
      return selectedInstance.url;
    }

    const selectedInstance = this.selectInstance(serviceName, healthyInstances);
    selectedInstance.activeConnections++;

    return selectedInstance.url;
  }

  private selectInstance(
    serviceName: string,
    instances: ServiceInstance[]
  ): ServiceInstance {
    switch (this.strategy) {
      case "round-robin":
        return this.roundRobinSelection(serviceName, instances);

      case "least-connections":
        return this.leastConnectionsSelection(instances);

      case "weighted":
        return this.weightedSelection(instances);

      case "random":
        return this.randomSelection(instances);

      default:
        return this.roundRobinSelection(serviceName, instances);
    }
  }

  private roundRobinSelection(
    serviceName: string,
    instances: ServiceInstance[]
  ): ServiceInstance {
    const counter = this.roundRobinCounters.get(serviceName) || 0;
    const selectedInstance = instances[counter % instances.length];
    this.roundRobinCounters.set(serviceName, counter + 1);
    return selectedInstance;
  }

  private leastConnectionsSelection(
    instances: ServiceInstance[]
  ): ServiceInstance {
    return instances.reduce((least, current) =>
      current.activeConnections < least.activeConnections ? current : least
    );
  }

  private weightedSelection(instances: ServiceInstance[]): ServiceInstance {
    const totalWeight = instances.reduce(
      (sum, instance) => sum + instance.weight,
      0
    );
    let random = Math.random() * totalWeight;

    for (const instance of instances) {
      random -= instance.weight;
      if (random <= 0) {
        return instance;
      }
    }

    return instances[0]; // Fallback
  }

  private randomSelection(instances: ServiceInstance[]): ServiceInstance {
    const randomIndex = Math.floor(Math.random() * instances.length);
    return instances[randomIndex];
  }

  public releaseConnection(serviceName: string, instanceUrl: string): void {
    const instances = this.serviceInstances.get(serviceName);
    if (instances) {
      const instance = instances.find((inst) => inst.url === instanceUrl);
      if (instance && instance.activeConnections > 0) {
        instance.activeConnections--;
      }
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  private async performHealthChecks(): Promise<void> {
    const healthCheckEnabled = this.configService.get<boolean>(
      "gateway.loadBalancing.healthCheck.enabled",
      true
    );

    if (!healthCheckEnabled) {
      return;
    }

    const healthCheckTimeout = this.configService.get<number>(
      "gateway.loadBalancing.healthCheck.timeout",
      5000
    );
    const promises: Promise<void>[] = [];

    for (const [serviceName, instances] of this.serviceInstances.entries()) {
      for (const instance of instances) {
        promises.push(
          this.checkInstanceHealth(serviceName, instance, healthCheckTimeout)
        );
      }
    }

    await Promise.allSettled(promises);
  }

  private async checkInstanceHealth(
    serviceName: string,
    instance: ServiceInstance,
    timeout: number
  ): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger.debug(
        `Health checking ${serviceName} at ${instance.url}/api/v1/health`
      );
      const response = await this.httpService.axiosRef.get(
        `${instance.url}/api/v1/health`,
        {
          timeout,
          validateStatus: (status) => status < 500, // Accept 4xx as healthy
        }
      );

      const responseTime = Date.now() - startTime;
      const wasUnhealthy = !instance.healthy;

      instance.healthy = response.status < 400;
      instance.lastHealthCheck = new Date();
      instance.responseTime = responseTime;

      this.logger.debug(
        `Health check result for ${serviceName}: status=${response.status}, healthy=${instance.healthy}, responseTime=${responseTime}ms`
      );

      if (wasUnhealthy && instance.healthy) {
        this.logger.log(
          `Service instance ${instance.id} (${serviceName}) is now healthy`
        );
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const wasHealthy = instance.healthy;

      instance.healthy = false;
      instance.lastHealthCheck = new Date();
      instance.responseTime = responseTime;

      this.logger.warn(
        `Health check failed for ${serviceName} at ${instance.url}/api/v1/health: ${error.message}`
      );

      if (wasHealthy) {
        this.logger.warn(
          `Service instance ${instance.id} (${serviceName}) is now unhealthy: ${error.message}`
        );
      }
    }
  }

  public getServiceInstances(serviceName: string): ServiceInstance[] {
    return this.serviceInstances.get(serviceName) || [];
  }

  public getAllServiceInstances(): Map<string, ServiceInstance[]> {
    return new Map(this.serviceInstances);
  }

  public getHealthyInstancesCount(serviceName: string): number {
    const instances = this.serviceInstances.get(serviceName) || [];
    return instances.filter((instance) => instance.healthy).length;
  }

  public getTotalInstancesCount(serviceName: string): number {
    const instances = this.serviceInstances.get(serviceName) || [];
    return instances.length;
  }

  public addServiceInstance(
    serviceName: string,
    url: string,
    weight: number = 1
  ): void {
    const instances = this.serviceInstances.get(serviceName) || [];
    const instanceId = `${serviceName}-${instances.length + 1}`;

    const newInstance: ServiceInstance = {
      id: instanceId,
      url,
      weight,
      healthy: true,
      lastHealthCheck: new Date(),
      responseTime: 0,
      activeConnections: 0,
    };

    instances.push(newInstance);
    this.serviceInstances.set(serviceName, instances);

    this.logger.log(
      `Added new instance ${instanceId} for service ${serviceName}: ${url}`
    );
  }

  public removeServiceInstance(
    serviceName: string,
    instanceId: string
  ): boolean {
    const instances = this.serviceInstances.get(serviceName);

    if (!instances) {
      return false;
    }

    const index = instances.findIndex((instance) => instance.id === instanceId);

    if (index === -1) {
      return false;
    }

    instances.splice(index, 1);
    this.logger.log(
      `Removed instance ${instanceId} from service ${serviceName}`
    );

    return true;
  }

  public updateInstanceWeight(
    serviceName: string,
    instanceId: string,
    weight: number
  ): boolean {
    const instances = this.serviceInstances.get(serviceName);

    if (!instances) {
      return false;
    }

    const instance = instances.find((inst) => inst.id === instanceId);

    if (!instance) {
      return false;
    }

    instance.weight = weight;
    this.logger.log(
      `Updated weight for instance ${instanceId} in service ${serviceName} to ${weight}`
    );

    return true;
  }
}
