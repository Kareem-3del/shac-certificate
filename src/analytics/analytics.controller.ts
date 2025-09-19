import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";

@Controller("api/analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("revenue")
  async getRevenue(@Query("days") days: string = "30") {
    const [periodStats, totalRevenue] = await Promise.all([
      this.analyticsService.getRevenueStats(parseInt(days)),
      this.analyticsService.getTotalRevenue(),
    ]);

    return {
      ...periodStats,
      total: totalRevenue, // Use total lifetime revenue for the main display
      periodTotal: periodStats.total, // Keep period total for reference
    };
  }

  @Get("certificates")
  async getCertificates(@Query("days") days: string = "30") {
    return await this.analyticsService.getCertificateStats(parseInt(days));
  }

  @Get("users")
  async getUsers(@Query("days") days: string = "30") {
    return await this.analyticsService.getUserStats(parseInt(days));
  }

  @Get("advertising")
  async getAdvertising(@Query("days") days: string = "30") {
    return await this.analyticsService.getAdvertisingROI(parseInt(days));
  }

  @Get("recent-activity")
  async getRecentActivity(@Query("limit") limit: string = "10") {
    return await this.analyticsService.getRecentActivity(parseInt(limit));
  }

  @Get("revenue-chart")
  async getRevenueChart(@Query("days") days: string = "30") {
    return await this.analyticsService.getRevenueChartData(parseInt(days));
  }

  @Get("certificates-chart")
  async getCertificatesChart(@Query("days") days: string = "30") {
    return await this.analyticsService.getCertificatesChartData(parseInt(days));
  }

  @Get("dashboard-overview")
  async getDashboardOverview() {
    return await this.analyticsService.getDashboardOverview();
  }

  @Get("ad-campaigns")
  async getAdCampaigns(@Query("platform") platform?: string) {
    return await this.analyticsService.getAdCampaignData(platform);
  }

  @Get("roi-breakdown")
  async getROIBreakdown(@Query("timeframe") timeframe: string = "30") {
    return await this.analyticsService.getROIBreakdown(parseInt(timeframe));
  }
}
