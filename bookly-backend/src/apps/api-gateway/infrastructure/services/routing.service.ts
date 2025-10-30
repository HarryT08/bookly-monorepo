import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosRequestConfig } from "axios";
import { CircuitBreakerService } from "./circuit-breaker.service";
import { LoadBalancerService } from "./load-balancer.service";

// Import URL maps from all services
import { AUTH_URLS } from "../../../auth-service/utils/maps/urls.map";
import { AVAILABILITY_URLS } from "../../../availability-service/utils/maps/urls.map";
import { REPORTS_URLS } from "../../../reports-service/utils/maps/urls.map";
import { RESOURCES_URLS } from "../../../resources-service/utils/maps/urls.map";
import { STOCKPILE_URLS } from "../../../stockpile-service/utils/maps/urls.map";

export interface RouteConfig {
  service: string;
  path: string;
  method: string;
  version?: string; // API version (v1, v2, etc.)
  targetVersion?: string; // Target microservice version
  timeout?: number;
  retries?: number;
  cache?: boolean;
  auth?: boolean;
  rateLimit?: boolean;
  deprecated?: boolean;
  deprecationDate?: string;
}

export interface ProxyRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
  params?: Record<string, string>;
}

export interface ProxyResponse {
  status: number;
  data: any;
  headers: Record<string, string>;
  duration: number;
}

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);
  private readonly routes: Map<string, RouteConfig> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly loadBalancer: LoadBalancerService,
    private readonly circuitBreaker: CircuitBreakerService
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Initialize versioned routes
    this.initializeV1Routes();
    this.initializeV2Routes(); // For future versions

    this.logger.log(`Initialized ${this.routes.size} versioned routes`);
  }

  /**
   * Helper function to build versioned routes using URL maps
   */
  private buildRouteVersion(
    service: string,
    endpoint: string,
    version: string = "v1"
  ): string {
    return `/${version}/${service}${endpoint}`;
  }

  private initializeV1Routes(): void {
    const version = "v1";
    // V1 Aggregated health route (handled by gateway)
    this.addVersionedRoute("GET", `/${version}/health`, "gateway", version, {
      auth: false,
    });

    // V1 Health routes - individual microservice health checks
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("auth", AUTH_URLS.HEALTH),
      "auth",
      version,
      { auth: false }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("resources", RESOURCES_URLS.HEALTH),
      "resources",
      version,
      { auth: false }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("availability", AVAILABILITY_URLS.HEALTH),
      "availability",
      version,
      { auth: false }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("stockpile", STOCKPILE_URLS.HEALTH),
      "stockpile",
      version,
      { auth: false }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("reports", REPORTS_URLS.HEALTH),
      "reports",
      version,
      { auth: false }
    );

    // V1 Authentication routes
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion("auth", AUTH_URLS.AUTH_LOGIN),
      "auth",
      version,
      { auth: false, rateLimit: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion("auth", AUTH_URLS.AUTH_REGISTER),
      "auth",
      version,
      { auth: false, rateLimit: true }
    );
    this.addVersionedRoute("POST", "/v1/auth/refresh", "auth", "v1", {
      auth: false,
      rateLimit: true,
    }); // Not in AUTH_URLS
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion("auth", AUTH_URLS.AUTH_LOGOUT),
      "auth",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion("auth", AUTH_URLS.AUTH_USER_PROFILE),
      "auth",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "PUT",
      this.buildRouteVersion("auth", AUTH_URLS.AUTH_USER_PROFILE),
      "auth",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion("auth", AUTH_URLS.PASSWORD_RESET_REQUEST),
      "auth",
      version,
      { auth: false, rateLimit: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion("auth", AUTH_URLS.PASSWORD_RESET_CONFIRM),
      "auth",
      version,
      { auth: false, rateLimit: true }
    ); // Not in AUTH_URLS
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion("auth", AUTH_URLS.EMAIL_VERIFY),
      "auth",
      version,
      { auth: false }
    );
    this.addVersionedRoute("GET", "/v1/auth/categories", "auth", version, {
      auth: false,
    }); // Not in AUTH_URLS
    this.addVersionedRoute(
      "GET",
      "/v1/auth/categories/defaults",
      "auth",
      version,
      { auth: false }
    ); // Not in AUTH_URLS

    // V1 OAuth routes
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("auth", AUTH_URLS.OAUTH_GOOGLE),
      "auth",
      version,
      { auth: false }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("auth", AUTH_URLS.OAUTH_GOOGLE_CALLBACK),
      "auth",
      version,
      { auth: false }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("auth", AUTH_URLS.OAUTH_MICROSOFT),
      "auth",
      version,
      { auth: false }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("auth", AUTH_URLS.OAUTH_MICROSOFT_CALLBACK),
      "auth",
      version,
      { auth: false }
    );

    // V1 User management routes
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("users", "/"),
      "auth",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("users", AUTH_URLS.USER_FIND_BY_ID),
      "auth",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "PUT",
      this.buildRouteVersion("users", AUTH_URLS.USER_UPDATE),
      "auth",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "DELETE",
      this.buildRouteVersion("users", AUTH_URLS.USER_DELETE),
      "auth",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "PUT",
      this.buildRouteVersion("users", AUTH_URLS.USER_ASSIGN_ROLE),
      "auth",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "PUT",
      this.buildRouteVersion("users", AUTH_URLS.USER_REMOVE_ROLE),
      "auth",
      version,
      { auth: true }
    );

    // V1 Role management routes
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("roles", ""),
      "auth",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion("roles", AUTH_URLS.ROLE_CREATE),
      "auth",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("roles", AUTH_URLS.ROLE_FIND),
      "auth",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("roles", AUTH_URLS.ROLE_FIND_BY_ID),
      "auth",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "PUT",
      this.buildRouteVersion("roles", AUTH_URLS.ROLE_UPDATE),
      "auth",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "DELETE",
      this.buildRouteVersion("roles", AUTH_URLS.ROLE_DELETE),
      "auth",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("roles", AUTH_URLS.ROLE_FIND_BY_ACTIVE),
      "auth",
      version,
      { auth: true, cache: true }
    );

    // V1 Category Role management routes
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("role/categories", ""),
      "auth",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion("role/categories", ""),
      "auth",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("role/categories", AUTH_URLS.CATEGORY_FIND_BY_ID),
      "auth",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion(
        "role/categories",
        AUTH_URLS.CATEGORY_FIND_BY_ACTIVE
      ),
      "auth",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "PUT",
      this.buildRouteVersion("role/categories", AUTH_URLS.CATEGORY_UPDATE),
      "auth",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "DELETE",
      this.buildRouteVersion("role/categories", AUTH_URLS.CATEGORY_DELETE),
      "auth",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("role/categories", AUTH_URLS.CATEGORY_DEFAULTS),
      "auth",
      version,
      { auth: true, cache: true }
    );

    // V1 Permission management routes
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("permissions", ""),
      "auth",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion("permissions", ""),
      "auth",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("permissions", AUTH_URLS.PERMISSION_FIND_BY_ID),
      "auth",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion(
        "permissions",
        AUTH_URLS.PERMISSION_FIND_BY_ACTIVE
      ),
      "auth",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion(
        "permissions",
        AUTH_URLS.PERMISSION_FIND_BY_RESOURCE
      ),
      "auth",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "PUT",
      this.buildRouteVersion("permissions", AUTH_URLS.PERMISSION_UPDATE),
      "auth",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "DELETE",
      this.buildRouteVersion("permissions", AUTH_URLS.PERMISSION_DELETE),
      "auth",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "PUT",
      this.buildRouteVersion("permissions", AUTH_URLS.PERMISSION_ACTIVATE),
      "auth",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "PUT",
      this.buildRouteVersion("permissions", AUTH_URLS.PERMISSION_DEACTIVATE),
      "auth",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion("permissions", AUTH_URLS.PERMISSION_SEED_DEFAULTS),
      "auth",
      version,
      { auth: true }
    );

    // V1 Resources routes
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("resources", ""),
      "resources",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion("resources", ""),
      "resources",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("resources", RESOURCES_URLS.RESOURCE_UPDATE),
      "resources",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "PUT",
      this.buildRouteVersion("resources", RESOURCES_URLS.RESOURCE_UPDATE),
      "resources",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "DELETE",
      this.buildRouteVersion("resources", RESOURCES_URLS.RESOURCE_DELETE),
      "resources",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("resources", RESOURCES_URLS.SEARCH),
      "resources",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion("resources", RESOURCES_URLS.BULK_CREATE),
      "resources",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("resources", RESOURCES_URLS.RESOURCE_CATEGORIES),
      "resources",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion(
        "resources",
        RESOURCES_URLS.RESOURCE_CATEGORY_CREATE
      ),
      "resources",
      version,
      { auth: true }
    );

    // V1 Availability routes
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion(
        "availability",
        AVAILABILITY_URLS.AVAILABILITY_GET
      ),
      "availability",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion(
        "availability",
        AVAILABILITY_URLS.AVAILABILITY_CHECK
      ),
      "availability",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("availability", AVAILABILITY_URLS.CALENDAR_VIEW),
      "availability",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("availability", AVAILABILITY_URLS.SCHEDULES),
      "availability",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion("availability", AVAILABILITY_URLS.SCHEDULE_CREATE),
      "availability",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "PUT",
      this.buildRouteVersion("availability", AVAILABILITY_URLS.SCHEDULE_UPDATE),
      "availability",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "DELETE",
      this.buildRouteVersion("availability", AVAILABILITY_URLS.SCHEDULE_DELETE),
      "availability",
      version,
      { auth: true }
    );

    // V1 Reservations routes
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("availability", AVAILABILITY_URLS.RESERVATIONS),
      "availability",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion(
        "availability",
        AVAILABILITY_URLS.RESERVATION_CREATE
      ),
      "availability",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion(
        "availability",
        AVAILABILITY_URLS.RESERVATIONS + "/:id"
      ),
      "availability",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "PUT",
      this.buildRouteVersion(
        "availability",
        AVAILABILITY_URLS.RESERVATION_UPDATE
      ),
      "availability",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "DELETE",
      this.buildRouteVersion(
        "availability",
        AVAILABILITY_URLS.RESERVATIONS + "/:id"
      ),
      "availability",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion(
        "availability",
        AVAILABILITY_URLS.RESERVATION_CANCEL
      ),
      "availability",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("availability", AVAILABILITY_URLS.HISTORY),
      "availability",
      version,
      { auth: true, cache: true }
    );

    // V1 Stockpile (Approval) routes
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("stockpile", STOCKPILE_URLS.APPROVAL_REQUESTS),
      "stockpile",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion("stockpile", STOCKPILE_URLS.APPROVAL_REQUESTS),
      "stockpile",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion(
        "stockpile",
        STOCKPILE_URLS.APPROVAL_REQUESTS + "/:id"
      ),
      "stockpile",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "PUT",
      this.buildRouteVersion(
        "stockpile",
        STOCKPILE_URLS.APPROVAL_REQUESTS + "/:id"
      ),
      "stockpile",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion(
        "stockpile",
        STOCKPILE_URLS.APPROVAL_REQUEST_APPROVE
      ),
      "stockpile",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion(
        "stockpile",
        STOCKPILE_URLS.APPROVAL_REQUEST_REJECT
      ),
      "stockpile",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("stockpile", STOCKPILE_URLS.APPROVAL_FLOWS),
      "stockpile",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion("stockpile", STOCKPILE_URLS.APPROVAL_FLOW_CREATE),
      "stockpile",
      version,
      { auth: true }
    );

    // V1 Document templates routes
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("stockpile", STOCKPILE_URLS.DOCUMENT_TEMPLATES),
      "stockpile",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion(
        "stockpile",
        STOCKPILE_URLS.DOCUMENT_TEMPLATE_CREATE
      ),
      "stockpile",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion(
        "stockpile",
        STOCKPILE_URLS.DOCUMENT_TEMPLATES + "/:id"
      ),
      "stockpile",
      version,
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "PUT",
      this.buildRouteVersion(
        "stockpile",
        STOCKPILE_URLS.DOCUMENT_TEMPLATE_UPDATE
      ),
      "stockpile",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "DELETE",
      this.buildRouteVersion(
        "stockpile",
        STOCKPILE_URLS.DOCUMENT_TEMPLATE_DELETE
      ),
      "stockpile",
      version,
      { auth: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion("stockpile", STOCKPILE_URLS.DOCUMENT_GENERATE),
      "stockpile",
      "v1",
      { auth: true }
    );

    // V1 Notification templates routes
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion(
        "stockpile",
        STOCKPILE_URLS.NOTIFICATION_TEMPLATES
      ),
      "stockpile",
      "v1",
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion(
        "stockpile",
        STOCKPILE_URLS.NOTIFICATION_TEMPLATE_CREATE
      ),
      "stockpile",
      "v1",
      { auth: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion(
        "stockpile",
        STOCKPILE_URLS.NOTIFICATION_TEMPLATE_BY_ID
      ),
      "stockpile",
      "v1",
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "PUT",
      this.buildRouteVersion(
        "stockpile",
        STOCKPILE_URLS.NOTIFICATION_TEMPLATE_UPDATE
      ),
      "stockpile",
      "v1",
      { auth: true }
    );
    this.addVersionedRoute(
      "DELETE",
      this.buildRouteVersion(
        "stockpile",
        STOCKPILE_URLS.NOTIFICATION_TEMPLATE_DELETE
      ),
      "stockpile",
      "v1",
      { auth: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion("stockpile", STOCKPILE_URLS.NOTIFICATION_SEND),
      "stockpile",
      "v1",
      { auth: true }
    );

    // V1 Reports routes
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("reports", ""),
      "reports",
      "v1",
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("reports", REPORTS_URLS.USAGE_REPORTS),
      "reports",
      "v1",
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion("reports", REPORTS_URLS.USAGE_REPORT_GENERATE),
      "reports",
      "v1",
      { auth: true }
    ); // Generic generate endpoint
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("reports", REPORTS_URLS.USAGE_REPORTS + "/:id"),
      "reports",
      "v1",
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("reports", REPORTS_URLS.USAGE_BY_RESOURCE),
      "reports",
      "v1",
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("reports", REPORTS_URLS.USAGE_BY_PROGRAM),
      "reports",
      "v1",
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("reports", REPORTS_URLS.USAGE_BY_PERIOD),
      "reports",
      "v1",
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("reports", REPORTS_URLS.USAGE_SUMMARY),
      "reports",
      "v1",
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("reports", REPORTS_URLS.ANALYTICS),
      "reports",
      "v1",
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "GET",
      this.buildRouteVersion("reports", REPORTS_URLS.DASHBOARD),
      "reports",
      "v1",
      { auth: true, cache: true }
    );
    this.addVersionedRoute(
      "POST",
      this.buildRouteVersion("reports", REPORTS_URLS.EXPORT),
      "reports",
      "v1",
      { auth: true }
    );
  }

  private initializeV2Routes(): void {
    // V2 routes can be added here for future versions
    // Example: Enhanced authentication with additional security
    // this.addVersionedRoute('POST', '/v2/auth/login', 'auth', 'v2', { auth: false, rateLimit: true, enhanced: true });
  }

  private addVersionedRoute(
    method: string,
    path: string,
    service: string,
    version: string,
    options: Partial<RouteConfig> = {}
  ): void {
    const key = `${method}:${path}`;
    const config: RouteConfig = {
      service,
      path,
      method,
      version,
      targetVersion: version, // Target microservice version
      timeout: this.configService.get(
        `gateway.microservices.${service}.timeout`,
        30000
      ),
      retries: this.configService.get(
        `gateway.microservices.${service}.retries`,
        3
      ),
      cache: false,
      auth: true,
      rateLimit: false,
      ...options,
    };

    this.routes.set(key, config);
  }

  public findRoute(method: string, path: string): RouteConfig | null {
    // Exact match first
    const exactKey = `${method}:${path}`;
    if (this.routes.has(exactKey)) {
      return this.routes.get(exactKey);
    }

    // Pattern matching for parameterized routes
    for (const [key, config] of this.routes.entries()) {
      const [routeMethod, routePath] = key.split(":");
      if (routeMethod === method && this.matchPath(routePath, path)) {
        return config;
      }
    }

    // If no versioned route found, try to find a fallback without version
    const pathWithoutVersion = this.extractPathWithoutVersion(path);
    if (pathWithoutVersion !== path) {
      return this.findRoute(method, pathWithoutVersion);
    }

    return null;
  }

  private extractPathWithoutVersion(path: string): string {
    // Remove version prefix like /v1, /v2, etc. and ensure leading slash
    const pathWithoutVersion = path.replace(/^\/v\d+/, "");
    return pathWithoutVersion.startsWith("/")
      ? pathWithoutVersion
      : "/" + pathWithoutVersion;
  }

  private extractVersionFromPath(path: string): string | null {
    const versionMatch = path.match(/^\/v(\d+)/);
    return versionMatch ? `v${versionMatch[1]}` : null;
  }

  private matchPath(pattern: string, path: string): boolean {
    // Convert pattern like /users/:id to regex
    const regexPattern = pattern
      .replace(/:[^/]+/g, "([^/]+)")
      .replace(/\//g, "\\/");

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  public async proxyRequest(
    request: ProxyRequest,
    route: RouteConfig
  ): Promise<ProxyResponse> {
    const startTime = Date.now();

    try {
      // Get service URL with load balancing
      const serviceUrl = await this.loadBalancer.getServiceUrl(route.service);

      // Build target URL with version handling
      let targetPath = request.url;

      // Debug logging
      this.logger.debug(`Original request.url: ${request.url}`);

      // If route has a version, ensure the microservice receives the correct path
      if (route.version && route.targetVersion) {
        // Remove gateway version from path and add target version if different
        const pathWithoutVersion = this.extractPathWithoutVersion(request.url);
        this.logger.debug(`Path without version: ${pathWithoutVersion}`);

        // Handle special routing for health endpoints
        if (pathWithoutVersion.endsWith("/health")) {
          // For health endpoints, only send /health to the service
          // /auth/health → /health, /resources/health → /health, etc.
          targetPath = `/api/v1/health`;
        } else {
          // For other endpoints, send the full path
          targetPath = `/api/v1${pathWithoutVersion}`;
        }

        // Add version info to headers for microservice version detection
        request.headers = {
          ...request.headers,
          "X-API-Version": route.version,
          "X-Target-Version": route.targetVersion,
        };
      }

      const fullUrl = `${serviceUrl}${targetPath}`;
      this.logger.debug(`Final proxy URL: ${fullUrl}`);

      // Check circuit breaker
      if (!this.circuitBreaker.canExecute(route.service)) {
        throw new Error(
          `Circuit breaker is open for service: ${route.service}`
        );
      }

      // Clean headers for proxy request
      const proxyHeaders = { ...request.headers };

      // Remove problematic headers that should be set by axios
      delete proxyHeaders["host"];
      delete proxyHeaders["content-length"];

      // Prepare request config
      const config: AxiosRequestConfig = {
        method: request.method as any,
        url: fullUrl,
        headers: proxyHeaders,
        timeout: route.timeout,
        data: request.body,
        params: request.query,
        validateStatus: (status) => status < 500, // Same as health check
      };

      // Execute request with retry logic
      const response = await this.httpService.axiosRef.request(config);

      // Record success for circuit breaker
      this.circuitBreaker.recordSuccess(route.service);

      const duration = Date.now() - startTime;

      this.logger.debug(
        `Proxied ${request.method} ${request.url} to ${route.service}${route.version ? ` (${route.version})` : ""} in ${duration}ms`
      );

      // Add version information to response headers
      const responseHeaders = {
        ...(response.headers as Record<string, string>),
        "X-Gateway-Version": route.version || "v1",
        "X-Service-Version": route.targetVersion || "v1",
      };

      return {
        status: response.status,
        data: response.data,
        headers: responseHeaders,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      // Record failure for circuit breaker
      this.circuitBreaker.recordFailure(route.service);

      this.logger.error(
        `Failed to proxy ${request.method} ${request.url} to ${route.service}${route.version ? ` (${route.version})` : ""}:`,
        error.message
      );

      throw {
        status: error.response?.status || 500,
        data: error.response?.data || {
          message: "Internal server error",
          code: "GATEWAY_ERROR",
        },
        headers: error.response?.headers || {},
        duration,
      };
    }
  }

  public getAllRoutes(): RouteConfig[] {
    return Array.from(this.routes.values());
  }

  public getRoutesByService(service: string): RouteConfig[] {
    return Array.from(this.routes.values()).filter(
      (route) => route.service === service
    );
  }
}
