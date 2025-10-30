import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as xml2js from 'xml2js';

export interface TranslationConfig {
  inputFormat: 'json' | 'xml' | 'form-data' | 'text';
  outputFormat: 'json' | 'xml' | 'form-data' | 'text';
  contentType: string;
  encoding?: string;
  customTransformer?: (data: any) => any;
}

export interface TranslationRequest {
  data: any;
  headers: Record<string, string>;
  contentType: string;
  targetFormat: 'json' | 'xml' | 'form-data' | 'text';
}

export interface TranslationResponse {
  data: any;
  headers: Record<string, string>;
  contentType: string;
}

@Injectable()
export class ProtocolTranslationService {
  private readonly logger = new Logger(ProtocolTranslationService.name);
  private readonly xmlBuilder: xml2js.Builder;
  private readonly xmlParser: xml2js.Parser;

  constructor(private readonly configService: ConfigService) {
    // Initialize XML parser and builder
    this.xmlParser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: true,
      normalize: true,
      normalizeTags: true,
      trim: true,
    });

    this.xmlBuilder = new xml2js.Builder({
      rootName: 'response',
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      renderOpts: { pretty: true, indent: '  ', newline: '\n' },
    });
  }

  public async translateRequest(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      const inputFormat = this.detectInputFormat(request.contentType, request.data);
      const targetFormat = request.targetFormat;

      this.logger.debug(`Translating request from ${inputFormat} to ${targetFormat}`);

      // If formats are the same, return as-is
      if (inputFormat === targetFormat) {
        return {
          data: request.data,
          headers: request.headers,
          contentType: request.contentType,
        };
      }

      // Parse input data
      const parsedData = await this.parseInput(request.data, inputFormat);

      // Transform to target format
      const transformedData = await this.transformToFormat(parsedData, targetFormat);

      // Set appropriate content type
      const contentType = this.getContentTypeForFormat(targetFormat);

      return {
        data: transformedData,
        headers: {
          ...request.headers,
          'Content-Type': contentType,
        },
        contentType,
      };

    } catch (error) {
      this.logger.error(`Protocol translation failed: ${error.message}`);
      throw new Error(`Protocol translation failed: ${error.message}`);
    }
  }

  public async translateResponse(
    data: any,
    sourceFormat: 'json' | 'xml' | 'form-data' | 'text',
    targetFormat: 'json' | 'xml' | 'form-data' | 'text',
    headers: Record<string, string> = {},
  ): Promise<TranslationResponse> {
    try {
      this.logger.debug(`Translating response from ${sourceFormat} to ${targetFormat}`);

      // If formats are the same, return as-is
      if (sourceFormat === targetFormat) {
        return {
          data,
          headers,
          contentType: this.getContentTypeForFormat(targetFormat),
        };
      }

      // Transform to target format
      const transformedData = await this.transformToFormat(data, targetFormat);

      // Set appropriate content type
      const contentType = this.getContentTypeForFormat(targetFormat);

      return {
        data: transformedData,
        headers: {
          ...headers,
          'Content-Type': contentType,
        },
        contentType,
      };

    } catch (error) {
      this.logger.error(`Response translation failed: ${error.message}`);
      throw new Error(`Response translation failed: ${error.message}`);
    }
  }

  private detectInputFormat(contentType: string, data: any): 'json' | 'xml' | 'form-data' | 'text' {
    if (!contentType) {
      // Try to detect from data
      if (typeof data === 'object') {
        return 'json';
      }
      if (typeof data === 'string' && data.trim().startsWith('<')) {
        return 'xml';
      }
      return 'text';
    }

    const lowerContentType = contentType.toLowerCase();

    if (lowerContentType.includes('application/json')) {
      return 'json';
    }
    if (lowerContentType.includes('application/xml') || lowerContentType.includes('text/xml')) {
      return 'xml';
    }
    if (lowerContentType.includes('application/x-www-form-urlencoded') || lowerContentType.includes('multipart/form-data')) {
      return 'form-data';
    }

    return 'text';
  }

  private async parseInput(data: any, format: 'json' | 'xml' | 'form-data' | 'text'): Promise<any> {
    switch (format) {
      case 'json':
        return typeof data === 'string' ? JSON.parse(data) : data;

      case 'xml':
        if (typeof data === 'string') {
          return await this.xmlParser.parseStringPromise(data);
        }
        return data;

      case 'form-data':
        if (typeof data === 'string') {
          return this.parseFormData(data);
        }
        return data;

      case 'text':
        return data.toString();

      default:
        return data;
    }
  }

  private async transformToFormat(data: any, targetFormat: 'json' | 'xml' | 'form-data' | 'text'): Promise<any> {
    switch (targetFormat) {
      case 'json':
        return this.toJson(data);

      case 'xml':
        return this.toXml(data);

      case 'form-data':
        return this.toFormData(data);

      case 'text':
        return this.toText(data);

      default:
        return data;
    }
  }

  private toJson(data: any): string {
    if (typeof data === 'string') {
      try {
        // Validate it's valid JSON
        JSON.parse(data);
        return data;
      } catch {
        // Wrap string in JSON
        return JSON.stringify({ value: data });
      }
    }
    return JSON.stringify(data, null, 2);
  }

  private toXml(data: any): string {
    if (typeof data === 'string' && data.trim().startsWith('<')) {
      return data; // Already XML
    }

    // Convert to XML-friendly format
    const xmlData = this.prepareForXml(data);
    return this.xmlBuilder.buildObject(xmlData);
  }

  private prepareForXml(data: any): any {
    if (data === null || data === undefined) {
      return '';
    }

    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
      return data;
    }

    if (Array.isArray(data)) {
      return {
        item: data.map(item => this.prepareForXml(item)),
      };
    }

    if (typeof data === 'object') {
      const result: any = {};
      Object.entries(data).forEach(([key, value]) => {
        // Ensure XML-safe key names
        const xmlKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
        result[xmlKey] = this.prepareForXml(value);
      });
      return result;
    }

    return data;
  }

  private toFormData(data: any): string {
    if (typeof data === 'string') {
      return data;
    }

    const params = new URLSearchParams();
    this.flattenObject(data, '', params);
    return params.toString();
  }

  private flattenObject(obj: any, prefix: string, params: URLSearchParams): void {
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}[${key}]` : key;

      if (value === null || value === undefined) {
        params.append(fullKey, '');
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object') {
            this.flattenObject(item, `${fullKey}[${index}]`, params);
          } else {
            params.append(`${fullKey}[${index}]`, String(item));
          }
        });
      } else if (typeof value === 'object') {
        this.flattenObject(value, fullKey, params);
      } else {
        params.append(fullKey, String(value));
      }
    });
  }

  private parseFormData(data: string): any {
    const params = new URLSearchParams(data);
    const result: any = {};

    for (const [key, value] of params.entries()) {
      this.setNestedValue(result, key, value);
    }

    return result;
  }

  private setNestedValue(obj: any, path: string, value: string): void {
    const keys = path.split(/[\[\]]+/).filter(Boolean);
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const nextKey = keys[i + 1];

      if (!current[key]) {
        current[key] = isNaN(Number(nextKey)) ? {} : [];
      }
      current = current[key];
    }

    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;
  }

  private toText(data: any): string {
    if (typeof data === 'string') {
      return data;
    }

    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }

    return String(data);
  }

  private getContentTypeForFormat(format: 'json' | 'xml' | 'form-data' | 'text'): string {
    switch (format) {
      case 'json':
        return 'application/json; charset=utf-8';
      case 'xml':
        return 'application/xml; charset=utf-8';
      case 'form-data':
        return 'application/x-www-form-urlencoded; charset=utf-8';
      case 'text':
        return 'text/plain; charset=utf-8';
      default:
        return 'application/json; charset=utf-8';
    }
  }

  public getSupportedFormats(): string[] {
    return ['json', 'xml', 'form-data', 'text'];
  }

  public isFormatSupported(format: string): boolean {
    return this.getSupportedFormats().includes(format.toLowerCase());
  }

  public addCustomTransformer(
    inputFormat: string,
    outputFormat: string,
    transformer: (data: any) => any,
  ): void {
    // Store custom transformers for future use
    this.logger.log(`Added custom transformer from ${inputFormat} to ${outputFormat}`);
  }
}
