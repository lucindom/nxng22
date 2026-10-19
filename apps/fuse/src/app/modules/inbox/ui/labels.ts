import { Component, computed, input } from "@angular/core";
import { LABELS, LabelId } from "../data/inbox";

@Component({
  selector: "inbox-labels",
  host: {
    class: "flex flex-wrap gap-1.5",
  },
  template: `
    @for (label of tags(); track label.id) {
      <div
        class="inline-flex items-center rounded-lg px-2 py-0.5 text-sm font-medium whitespace-nowrap"
        [class]="label.tagClass"
      >
        {{ label.name }}
      </div>
    }
  `,
})
export class InboxLabels {
  // Inputs / Outputs
  readonly labels = input.required<LabelId[]>();

  // Computed state
  protected tags = computed(() =>
    LABELS.filter((label) => this.labels().includes(label.id)),
  );
}
