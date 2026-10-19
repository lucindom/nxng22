import { Component, computed, input } from "@angular/core";
import { IntegrationType } from "../data/integrations";

const LABELS: Record<IntegrationType, string> = {
  "rest-api": "REST API",
  "mcp-server": "MCP server",
  webhook: "Webhook",
  "oauth-app": "OAuth app",
  sdk: "SDK",
};

@Component({
  selector: "integration-type-tag",
  host: {
    class: "flex",
  },
  template: `
    <div
      class="inline-flex items-center rounded-lg bg-neutral-a3 px-2 py-0.5 text-sm font-medium whitespace-nowrap text-neutral-a11"
    >
      {{ label() }}
    </div>
  `,
})
export class IntegrationTypeTag {
  // Inputs / Outputs
  readonly type = input.required<IntegrationType>();

  // Computed state
  protected label = computed(() => LABELS[this.type()]);
}
