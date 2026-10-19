import { SlicePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatTab, MatTabGroup } from "@angular/material/tabs";
import { MatTooltip } from "@angular/material/tooltip";
import { Router, RouterLink } from "@angular/router";
import {
  BuiPopover,
  BuiPopoverClose,
  BuiPopoverContent,
  BuiPopoverPortal,
  BuiPopoverTrigger,
  PopoverPosition,
} from "@/app/ui/popover";

import {
  INotification,
  INotificationAction,
  INotificationsConfig,
} from "../models/admin-layout-config";

type NotificationFilter = 0 | 1 | 2;

/** Campana con el panel de notificaciones (todas, no leídas, menciones). */
@Component({
  selector: "lib-notifications-menu",
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTabGroup,
    MatTab,
    MatTooltip,
    RouterLink,
    SlicePipe,
    BuiPopover,
    BuiPopoverTrigger,
    BuiPopoverPortal,
    BuiPopoverContent,
    BuiPopoverClose,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      buiPopover
      class="w-full sm:max-w-xs"
      [position]="position()"
      [closeOnScroll]="true"
    >
      <!-- Trigger -->
      <button matIconButton buiPopoverTrigger class="small">
        <mat-icon svgIcon="bell-dot" />
      </button>

      <!-- Panel -->
      <ng-template buiPopoverPortal>
        <div
          buiPopoverContent
          class="p-0 [--popover-border-radius:calc(var(--theme-border-radius)*1.5)]"
        >
          <!-- Header -->
          <div class="mx-6 mt-5 flex items-center gap-x-1">
            <div class="text-xl font-medium">Notifications</div>

            <div class="flex-auto"></div>

            <button
              matIconButton
              class="small"
              matTooltip="Mark all as read"
              (click)="config().source.markAllRead()"
            >
              <mat-icon svgIcon="check-check" />
            </button>
            @if (config().settingsRoute; as settingsRoute) {
              <a
                matIconButton
                buiPopoverClose
                class="small"
                matTooltip="Settings"
                [routerLink]="settingsRoute"
              >
                <mat-icon svgIcon="settings-2" />
              </a>
            }
            <button
              matIconButton
              buiPopoverClose
              class="small"
              matTooltip="Close"
            >
              <mat-icon svgIcon="x" />
            </button>
          </div>

          <!-- Filters -->
          <mat-tab-group
            class="mx-6 mt-2"
            mat-align-tabs="start"
            [animationDuration]="0"
            [fitInkBarToContent]="true"
            [mat-stretch-tabs]="false"
            [(selectedIndex)]="filter"
          >
            <mat-tab label="All"></mat-tab>
            <mat-tab label="Unread"></mat-tab>
            <mat-tab label="Mentions"></mat-tab>
          </mat-tab-group>

          <!-- Notifications -->
          <div
            class="flex flex-col gap-y-2 overflow-y-auto overscroll-contain px-6 pt-1 pb-4 sm:max-h-88"
          >
            @for (
              notification of filteredNotifications();
              track notification.id;
              let last = $last
            ) {
              <div
                class="flex gap-x-3 py-2"
                [class]="
                  notification.description
                    ? 'items-start'
                    : 'items-center *:mt-0'
                "
              >
                <!-- User photo / Icon -->
                @let user = notification.actor;
                @let icon = notification.icon;
                @if (user) {
                  @if (user.photo) {
                    <img
                      class="mt-1 size-7 shrink-0 rounded-lg object-cover"
                      width="28"
                      height="28"
                      [src]="user.photo"
                      [alt]="user.name"
                    />
                  } @else {
                    <div
                      class="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg bg-neutral-a4 font-medium text-neutral-a11"
                    >
                      {{ user.name | slice: 0 : 1 }}
                    </div>
                  }
                } @else if (icon) {
                  <div
                    class="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg bg-neutral-a4 font-medium text-neutral-a11"
                  >
                    <mat-icon class="size-3.5" [svgIcon]="icon" />
                  </div>
                }

                <div class="flex flex-col">
                  <!-- Title -->
                  <div class="font-medium">{{ notification.title }}</div>

                  <!-- Description -->
                  @if (notification.description) {
                    <div class="text-xs">{{ notification.description }}</div>
                  }

                  <!-- Actions -->
                  @if (notification.actions) {
                    <div class="mt-2.5 flex items-center gap-x-2">
                      @for (
                        action of notification.actions;
                        track action.value
                      ) {
                        <button
                          matButton
                          class="tiny"
                          [class]="action.variant"
                          (click)="respond(notification, action)"
                        >
                          {{ action.label }}
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>

              @if (!last) {
                <mat-divider />
              }
            }
          </div>

          <!-- Footer -->
          @if (config().viewAllRoute; as viewAllRoute) {
            <div class="border-t p-1">
              <a
                matButton
                buiPopoverClose
                class="link w-full"
                [routerLink]="viewAllRoute"
              >
                View all notifications
              </a>
            </div>
          }
        </div>
      </ng-template>
    </div>
  `,
})
export class NotificationsMenu {
  readonly config = input.required<INotificationsConfig>();
  readonly position = input<PopoverPosition>("bottom-end");

  protected readonly filter = signal<NotificationFilter>(0);
  protected readonly filteredNotifications = computed(() => {
    const filter = this.filter();

    return this.config()
      .source.notifications()
      .filter((notification) => {
        if (filter === 1) {
          return !notification.read;
        }

        return filter === 2 ? notification.mention : true;
      });
  });

  private readonly router = inject(Router);
  private readonly popover = viewChild.required(BuiPopover);

  protected respond(
    notification: INotification,
    action: INotificationAction,
  ): void {
    if (action.value === "view" || action.value === "open") {
      this.open(notification);
      return;
    }

    this.config().source.resolve(notification.id);
  }

  private open(notification: INotification): void {
    this.config().source.markRead(notification.id);
    this.popover().close();

    if (notification.link) {
      this.router.navigate(notification.link);
    }
  }
}
