import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { AnalyticsModule } from "../analytics/analytics.module";
import { UsersModule } from "../users/users.module";
import { CertificatesModule } from "../certificates/certificates.module";
import { AuditModule } from "../audit/audit.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";

@Module({
  imports: [
    AnalyticsModule,
    UsersModule,
    CertificatesModule,
    AuditModule,
    SubscriptionsModule,
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}
