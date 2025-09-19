import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { Certificate } from "../certificates/certificate.entity";
import { User } from "../users/user.entity";
import { Transaction } from "../payment/entities/transaction.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Certificate, User, Transaction])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
