import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan, Between } from "typeorm";
import { Certificate } from "../certificates/certificate.entity";
import { User } from "../users/user.entity";
import { Transaction } from "../payment/entities/transaction.entity";

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Certificate)
    private certificatesRepository: Repository<Certificate>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async getRevenueStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const previousStartDate = new Date();
    previousStartDate.setDate(previousStartDate.getDate() - days * 2);

    // Current period revenue
    const currentRevenue = await this.transactionsRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "total")
      .where("transaction.created_at > :startDate", { startDate })
      .andWhere("transaction.status = :status", { status: "completed" })
      .getRawOne();

    // Previous period revenue for comparison
    const previousRevenue = await this.transactionsRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "total")
      .where(
        "transaction.created_at BETWEEN :previousStartDate AND :startDate",
        {
          previousStartDate,
          startDate,
        },
      )
      .andWhere("transaction.status = :status", { status: "completed" })
      .getRawOne();

    const current = parseFloat(currentRevenue?.total || "0");
    const previous = parseFloat(previousRevenue?.total || "0");
    const growth =
      previous > 0
        ? parseFloat((((current - previous) / previous) * 100).toFixed(1))
        : 0.0;

    return {
      total: current,
      growth: growth,
      previousPeriod: previous,
    };
  }

  async getTotalRevenue() {
    // Get total lifetime revenue from all completed transactions
    const totalRevenue = await this.transactionsRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "total")
      .where("transaction.status = :status", { status: "completed" })
      .getRawOne();

    return parseFloat(totalRevenue?.total || "0");
  }

  async getCertificateStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const previousStartDate = new Date();
    previousStartDate.setDate(previousStartDate.getDate() - days * 2);

    // Current period certificates
    const currentCerts = await this.certificatesRepository
      .createQueryBuilder("certificate")
      .where("certificate.created_at > :startDate", { startDate })
      .getCount();

    // Previous period certificates
    const previousCerts = await this.certificatesRepository
      .createQueryBuilder("certificate")
      .where(
        "certificate.created_at BETWEEN :previousStartDate AND :startDate",
        {
          previousStartDate,
          startDate,
        },
      )
      .getCount();

    const growth = currentCerts - previousCerts;

    // Total active certificates (not expired)
    const totalActive = await this.certificatesRepository
      .createQueryBuilder("certificate")
      .where("certificate.express > :now", { now: new Date() })
      .getCount();

    return {
      total: totalActive,
      growth: growth,
      currentPeriod: currentCerts,
      previousPeriod: previousCerts,
    };
  }

  async getUserStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total users
    const totalUsers = await this.usersRepository.count();

    // New users in period
    const newUsers = await this.usersRepository
      .createQueryBuilder("user")
      .where("user.created_at > :startDate", { startDate })
      .getCount();

    // Today's new users
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUsers = await this.usersRepository
      .createQueryBuilder("user")
      .where("user.created_at > :today", { today })
      .getCount();

    return {
      total: totalUsers,
      growth: todayUsers,
      newInPeriod: newUsers,
    };
  }

  async getAdvertisingROI(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get revenue from transactions
    const revenue = await this.transactionsRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "total")
      .where("transaction.created_at > :startDate", { startDate })
      .andWhere("transaction.status = :status", { status: "completed" })
      .getRawOne();

    const totalRevenue = parseFloat(revenue?.total || "0");

    // Ad spend calculation (you'll need to integrate with actual ad platforms)
    // For now, we'll use a placeholder calculation
    const estimatedAdSpend = totalRevenue * 0.15; // Assuming 15% of revenue goes to ads
    const roi =
      estimatedAdSpend > 0
        ? ((totalRevenue - estimatedAdSpend) / estimatedAdSpend) * 100
        : 0;

    // Previous period for comparison
    const previousStartDate = new Date();
    previousStartDate.setDate(previousStartDate.getDate() - days * 2);

    const previousRevenue = await this.transactionsRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "total")
      .where(
        "transaction.created_at BETWEEN :previousStartDate AND :startDate",
        {
          previousStartDate,
          startDate,
        },
      )
      .andWhere("transaction.status = :status", { status: "completed" })
      .getRawOne();

    const prevTotalRevenue = parseFloat(previousRevenue?.total || "0");
    const prevAdSpend = prevTotalRevenue * 0.15;
    const prevROI =
      prevAdSpend > 0
        ? ((prevTotalRevenue - prevAdSpend) / prevAdSpend) * 100
        : 0;
    const roiTrend = roi - prevROI;

    return {
      roi: Math.round(roi),
      trend: Math.round(roiTrend),
      totalSpend: estimatedAdSpend,
      totalRevenue: totalRevenue,
    };
  }

  async getRecentActivity(limit: number = 10) {
    const activities = [];

    // Recent certificates
    const recentCerts = await this.certificatesRepository
      .createQueryBuilder("certificate")
      .orderBy("certificate.created_at", "DESC")
      .limit(5)
      .getMany();

    recentCerts.forEach((cert) => {
      activities.push({
        type: "certificate",
        description: `Certificate generated for ${cert.name}`,
        timestamp: cert.created_at,
        metadata: { certificateId: cert.id },
      });
    });

    // Recent users
    const recentUsers = await this.usersRepository
      .createQueryBuilder("user")
      .orderBy("user.created_at", "DESC")
      .limit(3)
      .getMany();

    recentUsers.forEach((user) => {
      activities.push({
        type: "user",
        description: `New user registered: ${user.username}`,
        timestamp: user.created_at,
        metadata: { userId: user.id },
      });
    });

    // Recent transactions
    const recentTransactions = await this.transactionsRepository
      .createQueryBuilder("transaction")
      .orderBy("transaction.created_at", "DESC")
      .limit(3)
      .getMany();

    recentTransactions.forEach((transaction) => {
      activities.push({
        type: "payment",
        description: `Payment received: $${transaction.amount}`,
        timestamp: transaction.created_at,
        metadata: { transactionId: transaction.id },
      });
    });

    // Sort all activities by timestamp and return limited results
    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, limit);
  }

  async getRevenueChartData(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.transactionsRepository
      .createQueryBuilder("transaction")
      .select([
        "DATE(transaction.created_at) as date",
        "SUM(transaction.amount) as amount",
      ])
      .where("transaction.created_at > :startDate", { startDate })
      .andWhere("transaction.status = :status", { status: "completed" })
      .groupBy("DATE(transaction.created_at)")
      .orderBy("DATE(transaction.created_at)", "ASC")
      .getRawMany();

    const labels = [];
    const chartData = [];

    // Fill in missing dates with 0 values
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateString = date.toISOString().split("T")[0];

      labels.push(
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      );

      const dayData = data.find((d) => d.date === dateString);
      chartData.push(dayData ? parseFloat(dayData.amount) : 0);
    }

    return { labels, data: chartData };
  }

  async getCertificatesChartData(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.certificatesRepository
      .createQueryBuilder("certificate")
      .select(["DATE(certificate.created_at) as date", "COUNT(*) as count"])
      .where("certificate.created_at > :startDate", { startDate })
      .groupBy("DATE(certificate.created_at)")
      .orderBy("DATE(certificate.created_at)", "ASC")
      .getRawMany();

    const labels = [];
    const chartData = [];

    // Fill in missing dates with 0 values
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateString = date.toISOString().split("T")[0];

      labels.push(
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      );

      const dayData = data.find((d) => d.date === dateString);
      chartData.push(dayData ? parseInt(dayData.count) : 0);
    }

    return { labels, data: chartData };
  }

  async getDashboardOverview() {
    const [revenue, totalRevenue, certificates, users, advertising] =
      await Promise.all([
        this.getRevenueStats(),
        this.getTotalRevenue(),
        this.getCertificateStats(),
        this.getUserStats(),
        this.getAdvertisingROI(),
      ]);

    return {
      revenue: {
        ...revenue,
        totalLifetime: totalRevenue,
      },
      certificates,
      users,
      advertising,
      timestamp: new Date(),
    };
  }

  async getAdCampaignData(platform?: string) {
    // This would integrate with actual ad platform APIs
    // For now, returning calculated data based on revenue and user acquisition

    const revenue = await this.getRevenueStats();
    const users = await this.getUserStats();

    const campaigns = [
      {
        platform: "google",
        name: "SHA Certificate Campaign - Google Ads",
        spend: revenue.total * 0.08, // 8% of revenue
        conversions: Math.floor(users.newInPeriod * 0.6), // 60% from Google
        revenue: revenue.total * 0.6,
        roi: 650, // Calculated ROI%
        status: "active",
      },
      {
        platform: "snapchat",
        name: "SHA Certificate Campaign - Snapchat Ads",
        spend: revenue.total * 0.07, // 7% of revenue
        conversions: Math.floor(users.newInPeriod * 0.4), // 40% from Snapchat
        revenue: revenue.total * 0.4,
        roi: 471, // Calculated ROI%
        status: "active",
      },
    ];

    return platform
      ? campaigns.filter((c) => c.platform === platform)
      : campaigns;
  }

  async getROIBreakdown(days: number = 30) {
    const campaigns = await this.getAdCampaignData();
    const totalSpend = campaigns.reduce(
      (sum, campaign) => sum + campaign.spend,
      0,
    );
    const totalRevenue = campaigns.reduce(
      (sum, campaign) => sum + campaign.revenue,
      0,
    );
    const overallROI =
      totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;

    return {
      overall: {
        spend: totalSpend,
        revenue: totalRevenue,
        roi: Math.round(overallROI),
      },
      campaigns,
      period: `Last ${days} days`,
    };
  }
}
