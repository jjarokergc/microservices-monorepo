declare module '@example-org/common/lib/tracing.js' {
  import type { Tracer } from '@opentelemetry/api';

  /**
   * Initialize OpenTelemetry tracing for a service
   * and return a tracer instance.
   */
  function tracing(serviceName: string): Tracer;

  export = tracing;
}
