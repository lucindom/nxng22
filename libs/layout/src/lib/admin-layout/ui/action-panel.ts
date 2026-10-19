import { Listbox, Option } from "@angular/aria/listbox";
import { NgOptimizedImage, SlicePipe } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from "@angular/core";
import { MatIconButton } from "@angular/material/button";
import { MatDivider } from "@angular/material/divider";
import { MatIcon } from "@angular/material/icon";
import {
  BuiDialog,
  BuiDialogBackdrop,
  BuiDialogBody,
  BuiDialogClose,
  BuiDialogContent,
  BuiDialogPortal,
  BuiDialogTrigger,
} from "@/app/ui/dialog";

import { ISearchData } from "../models/admin-layout-config";

interface IPanelFilter {
  value: string;
  label: string;
  icon: string;
}

interface IQuickAction {
  value: string;
  label: string;
  icon: string;
  shortcut: string;
}

interface IFooterHint {
  label: string;
  icon: string;
}

const FILTERS: readonly IPanelFilter[] = [
  { value: "projects", label: "Projects", icon: "folder-kanban" },
  { value: "tasks", label: "Tasks", icon: "list-todo" },
  { value: "users", label: "Users", icon: "users" },
  { value: "logs", label: "Logs", icon: "logs" },
  { value: "settings", label: "Settings", icon: "settings" },
];

const QUICK_ACTIONS: readonly IQuickAction[] = [
  {
    value: "create-project",
    label: "Create new project",
    icon: "folder-kanban",
    shortcut: "⌘⇧P",
  },
  {
    value: "create-task",
    label: "Create new task",
    icon: "circle-check",
    shortcut: "⌘⇧T",
  },
  {
    value: "create-user",
    label: "Add new user",
    icon: "user-plus",
    shortcut: "⌘⇧U",
  },
];

const FOOTER_HINTS: readonly IFooterHint[] = [
  { label: "Navigate", icon: "arrow-up-down" },
  { label: "Select", icon: "corner-down-left" },
  { label: "Close", icon: "circle-arrow-out-up-left" },
];

const OPTION_CLASS =
  "flex h-9 cursor-pointer items-center gap-x-2 rounded-lg px-2 hover:bg-neutral-a3";
const SECTION_TITLE_CLASS =
  "px-4 text-xs font-medium tracking-wide text-neutral-a11";

/** Buscador tipo paleta de comandos; los usuarios y proyectos vienen de la app. */
@Component({
  selector: "lib-action-panel",
  imports: [
    MatIcon,
    Listbox,
    Option,
    NgOptimizedImage,
    SlicePipe,
    MatIconButton,
    MatDivider,
    BuiDialog,
    BuiDialogPortal,
    BuiDialogContent,
    BuiDialogBackdrop,
    BuiDialogTrigger,
    BuiDialogClose,
    BuiDialogBody,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div buiDialog class="w-full max-w-xl">
      <!-- Trigger -->
      @if (compact()) {
        <button mat-icon-button buiDialogTrigger class="tertiary">
          <mat-icon class="size-4" svgIcon="search" />
        </button>
      } @else {
        <div
          buiDialogTrigger
          class="flex cursor-pointer items-center gap-x-2 rounded-md border bg-white p-1 ps-2 select-none dark:bg-neutral-4"
        >
          <mat-icon class="size-4" svgIcon="search" />
          <div class="flex-auto truncate text-sm text-neutral-a10">
            Search anything
          </div>
          <kbd>⌘K</kbd>
        </div>
      }

      <!-- Panel -->
      <ng-template buiDialogPortal>
        <div buiDialogBackdrop></div>
        <div buiDialogContent class="flex max-w-none flex-col gap-y-0 p-0">
          <!-- Search field -->
          <div class="relative flex items-center">
            <mat-icon
              class="pointer-events-none absolute start-4 size-4"
              svgIcon="search"
            />
            <input
              id="search"
              type="text"
              class="w-full ps-10 pe-14 pt-4 pb-3.5 outline-0"
              placeholder="Start typing to search..."
            />
            <kbd class="absolute end-4">⌘/</kbd>
          </div>

          <mat-divider />

          <div buiDialogBody class="py-4">
            <!-- Filters -->
            <div class="flex items-start">
              <div
                ngListbox
                class="flex flex-wrap items-center gap-2 px-4"
                orientation="horizontal"
                selectionMode="explicit"
                multi="true"
                [(value)]="selectedFilter"
              >
                @for (filter of filters; track filter.value) {
                  <div
                    ngOption
                    class="flex cursor-pointer items-center gap-x-1.5 rounded-md py-1 ps-1.5 pe-2 ring-1 ring-neutral-a6 hover:bg-neutral-a2 aria-selected:bg-neutral-a3"
                    [value]="filter.value"
                  >
                    <mat-icon class="size-3.5" [svgIcon]="filter.icon" />
                    <div class="text-sm">{{ filter.label }}</div>
                  </div>
                }
              </div>

              <div class="flex-auto"></div>

              <div class="flex items-center gap-x-1 pe-4">
                <button matIconButton class="tiny">
                  <mat-icon svgIcon="list-filter" />
                </button>

                <button matIconButton class="tiny">
                  <mat-icon svgIcon="arrow-up-narrow-wide" />
                </button>
              </div>
            </div>

            <!-- Users -->
            <div class="mt-4 flex flex-col gap-y-2">
              <div [class]="sectionTitleClass">USERS</div>
              <div
                ngListbox
                class="flex flex-col gap-y-1 px-2.5"
                orientation="vertical"
                [readonly]="true"
              >
                @for (user of data().users; track user.id) {
                  <div
                    ngOption
                    buiDialogClose
                    [class]="optionClass"
                    [value]="user.id"
                  >
                    @if (user.photo) {
                      <img
                        class="rounded-full object-cover"
                        width="20"
                        height="20"
                        [ngSrc]="user.photo"
                        [alt]="'Photo of ' + user.name"
                      />
                    } @else {
                      <div
                        class="flex size-5 items-center justify-center rounded-full bg-neutral-a3 text-xs font-medium text-neutral-a11"
                      >
                        {{ user.name | slice: 0 : 1 }}
                      </div>
                    }
                    <div class="flex items-center gap-x-1.5 truncate">
                      <div>{{ user.name }}</div>
                      <div class="text-neutral-a7">&bull;</div>
                      <div class="truncate text-sm text-neutral-a11">
                        {{ user.email }}
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Projects -->
            <div class="mt-4 flex flex-col gap-y-2">
              <div [class]="sectionTitleClass">PROJECTS</div>
              <div
                ngListbox
                class="flex flex-col gap-y-1 px-2.5"
                orientation="vertical"
                [readonly]="true"
              >
                @for (project of data().projects; track project.id) {
                  <div
                    ngOption
                    buiDialogClose
                    [class]="optionClass"
                    [value]="project.id"
                  >
                    <div class="flex size-5 items-center justify-center">
                      <div
                        class="size-2.5 rounded-full"
                        [class]="project.colorClass"
                      ></div>
                    </div>
                    <div class="truncate">{{ project.label }}</div>
                  </div>
                }
              </div>
            </div>

            <mat-divider class="my-4" />

            <!-- Quick actions -->
            <div class="flex flex-col gap-y-2">
              <div [class]="sectionTitleClass">QUICK ACTIONS</div>
              <div
                ngListbox
                class="flex flex-col gap-y-1 px-2.5"
                orientation="vertical"
                [readonly]="true"
              >
                @for (action of quickActions; track action.value) {
                  <div ngOption [class]="optionClass" [value]="action.value">
                    <div class="flex size-5 items-center justify-center">
                      <mat-icon class="size-4" [svgIcon]="action.icon" />
                    </div>
                    <div class="flex-auto">{{ action.label }}</div>
                    <kbd>{{ action.shortcut }}</kbd>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="mt-0 flex items-center gap-x-4 border-t bg-neutral-a2 px-4 py-2"
          >
            @for (hint of footerHints; track hint.label) {
              <div class="flex items-center">
                <kbd class="flex items-center">
                  <mat-icon class="size-3" [svgIcon]="hint.icon" />
                </kbd>
                <span class="ms-2 text-sm text-neutral-a11">{{
                  hint.label
                }}</span>
              </div>
            }

            <div class="flex-auto"></div>

            <button matIconButton>
              <mat-icon svgIcon="settings" />
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
})
export class ActionPanel {
  readonly data = input.required<ISearchData>();
  readonly compact = input(false, { transform: booleanAttribute });

  protected readonly filters = FILTERS;
  protected readonly quickActions = QUICK_ACTIONS;
  protected readonly footerHints = FOOTER_HINTS;
  protected readonly optionClass = OPTION_CLASS;
  protected readonly sectionTitleClass = SECTION_TITLE_CLASS;
  protected readonly selectedFilter = signal(["projects", "tasks", "users"]);
}
