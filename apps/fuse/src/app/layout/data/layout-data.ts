import {
  afterNextRender,
  computed,
  inject,
  Injectable,
  Injector,
  signal,
} from "@angular/core";
import { INotification, INotificationsSource } from "@nx-ng-v22/layout";

import type { InboxService } from "../../modules/inbox/data/inbox";
import type {
  Notification,
  NotificationsService,
} from "../../modules/notifications/data/notifications";

const toNotification = (notification: Notification): INotification => ({
  id: notification.id,
  title: notification.title,
  description: notification.description,
  icon: notification.icon,
  actor: notification.actor,
  actions: notification.actions,
  mention: notification.mention,
  read: notification.read,
  link: notification.target?.link,
});

/**
 * Datos del layout que viven en módulos de ruta (notificaciones y bandeja).
 * Los módulos se cargan en segundo plano tras el primer render, así su código
 * y sus datos no entran en el bundle inicial.
 */
@Injectable({ providedIn: "root" })
export class FuseLayoutData implements INotificationsSource {
  private readonly injector = inject(Injector);
  private readonly notificationsService = signal<NotificationsService | null>(
    null,
  );
  private readonly inboxService = signal<InboxService | null>(null);

  readonly notifications = computed(() =>
    (this.notificationsService()?.notifications() ?? []).map(toNotification),
  );
  readonly badges = computed(() => ({
    "mail.inbox": this.inboxService()?.unread() ?? 0,
  }));

  constructor() {
    afterNextRender(() => void this.load());
  }

  markAllRead(): void {
    this.notificationsService()?.markAllRead();
  }

  markRead(id: string): void {
    this.notificationsService()?.setRead(id, true);
  }

  resolve(id: string): void {
    this.notificationsService()?.resolve(id);
  }

  private async load(): Promise<void> {
    const [{ NotificationsService }, { InboxService }] = await Promise.all([
      import("../../modules/notifications/data/notifications"),
      import("../../modules/inbox/data/inbox"),
    ]);

    this.notificationsService.set(this.injector.get(NotificationsService));
    this.inboxService.set(this.injector.get(InboxService));
  }
}
