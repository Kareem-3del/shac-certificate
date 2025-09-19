import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Session,
  Res,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { AnalyticsService } from "../analytics/analytics.service";
import { UsersService } from "../users/users.service";
import { CertificatesService } from "../certificates/certificates.service";
import { AuditService } from "../audit/audit.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { SettingsService } from "../certificates/settings/settings.service";
import { User } from "../users/user.entity";

@Controller("dashboard")
export class DashboardController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly usersService: UsersService,
    private readonly certificatesService: CertificatesService,
    private readonly auditService: AuditService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly settingsService: SettingsService,
  ) {}

  @Get("test")
  async testTemplate(@Res() res: Response) {
    // Temporary test route to check template rendering
    const mockData = {
      overview: {
        revenue: { total: 1000, growth: 5.5 },
        certificates: { total: 150, growth: 12 },
        users: { total: 45, growth: 3 },
        advertising: { roi: 125, trend: 8.2 },
      },
      recentActivity: [],
      revenueChart: { labels: ["Jan", "Feb"], data: [100, 200] },
      certificatesChart: { labels: ["Jan", "Feb"], data: [10, 20] },
    };

    const mockUser = { id: 1, username: "test", role: "admin" };

    return res.render("dashboard/index", {
      title: "Dashboard Overview",
      currentPage: "overview",
      pageTitle: "Dashboard Overview",
      pageDescription: "Monitor your system performance and analytics",
      includeChartJS: true,
      additionalStyles: null,
      additionalScripts: null,
      pageScripts: null,
      user: mockUser,
      ...mockData,
    });
  }

  @Get("")
  async showDashboard(
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }

    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      const overview = await this.analyticsService.getDashboardOverview();
      const recentActivity = await this.analyticsService.getRecentActivity();
      const revenueChart = await this.analyticsService.getRevenueChartData();
      const certificatesChart =
        await this.analyticsService.getCertificatesChartData();

      return res.render("dashboard/index", {
        title: "Dashboard Overview",
        currentPage: "overview",
        pageTitle: "Dashboard Overview",
        pageDescription: "Monitor your system performance and analytics",
        includeChartJS: true,
        additionalStyles: null,
        additionalScripts: null,
        pageScripts: null,
        user: currentUser,
        overview,
        recentActivity,
        revenueChart,
        certificatesChart,
      });
    } catch (error) {
      console.error("Dashboard Error:", error);

      // Instead of throwing an exception, render an error state within the dashboard
      return res.render("dashboard/error-boundary", {
        title: "Dashboard - Error",
        currentPage: "overview",
        pageTitle: "Dashboard Error",
        pageDescription: "There was an error loading the dashboard",
        includeChartJS: false,
        additionalStyles: null,
        additionalScripts: null,
        pageScripts: null,
        user: currentUser,
        error: {
          message: error.message || "An unexpected error occurred",
          details: process.env.NODE_ENV === "development" ? error.stack : null,
        },
      });
    }
  }

  @Get("analytics")
  async showAnalytics(
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }

    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      const overview = await this.analyticsService.getDashboardOverview();
      const recentActivity = await this.analyticsService.getRecentActivity();
      const revenueChart = await this.analyticsService.getRevenueChartData();
      const certificatesChart =
        await this.analyticsService.getCertificatesChartData();

      return res.render("dashboard/analytics-dashboard", {
        title: "Analytics Dashboard",
        currentPage: "analytics",
        pageTitle: "Analytics Dashboard",
        pageDescription: "Monitor your system performance and analytics",
        includeChartJS: true,
        additionalStyles: null,
        additionalScripts: null,
        pageScripts: null,
        user: currentUser,
        overview,
        recentActivity,
        revenueChart,
        certificatesChart,
      });
    } catch (error) {
      console.error("Analytics Error:", error);

      return res.render("dashboard/error-boundary", {
        title: "Analytics - Error",
        currentPage: "analytics",
        pageTitle: "Analytics Error",
        pageDescription: "There was an error loading analytics",
        includeChartJS: false,
        additionalStyles: null,
        additionalScripts: null,
        pageScripts: null,
        user: currentUser,
        error: {
          message: error.message || "An unexpected error occurred",
          details: process.env.NODE_ENV === "development" ? error.stack : null,
        },
      });
    }
  }

  @Get("advertising")
  async showAdvertising(
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }

    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      const campaigns = await this.analyticsService.getAdCampaignData();
      const roiBreakdown = await this.analyticsService.getROIBreakdown();
      const advertising = await this.analyticsService.getAdvertisingROI();

      return res.render("dashboard/advertising", {
        layout: "layouts/dashboard",
        title: "Advertising ROI",
        currentPage: "advertising",
        pageTitle: "Advertising ROI Analysis",
        pageDescription:
          "Monitor your advertising campaigns and return on investment",
        includeChartJS: true,
        user: currentUser,
        campaigns,
        roiBreakdown,
        advertising,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error loading advertising data",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("certificates")
  async showCertificates(
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }

    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      const certificates = await this.analyticsService.getCertificateStats();
      const chartData = await this.analyticsService.getCertificatesChartData();

      return res.render("dashboard/certificates-dashboard", {
        title: "Certificates Management",
        currentPage: "certificates",
        pageTitle: "Certificates Management",
        pageDescription: "Monitor certificate generation and performance",
        includeChartJS: true,
        additionalStyles: null,
        additionalScripts: null,
        pageScripts: null,
        user: currentUser,
        certificates,
        chartData,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error loading certificates data",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("users")
  async showUsers(
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }

    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    // Redirect to the list page as default
    return res.redirect("/dashboard/users/list");
  }

  @Get("users/list")
  async showUsersList(
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }

    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      const users = await this.usersService.findAll();
      const userStats = await this.analyticsService.getUserStats();

      return res.render("dashboard/users/list", {
        title: "All Users",
        currentPage: "users",
        pageTitle: "All Users",
        pageDescription: "Manage user accounts and permissions",
        breadcrumbs: [
          { label: "Users", url: "/dashboard/users" },
          { label: "All Users" },
        ],
        user: currentUser,
        users,
        userStats,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error loading users list",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("users/:id")
  async showUser(
    @Param("id") id: string,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }

    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      const user = await this.usersService.findById(parseInt(id));
      if (!user) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }

      return res.render("dashboard/users/view", {
        layout: "layouts/dashboard",
        title: `User Details - ${user.username}`,
        currentPage: "users",
        pageTitle: "User Details",
        pageDescription: "View and manage user account information",
        breadcrumbs: [
          { label: "Users", url: "/dashboard/users" },
          { label: "All Users", url: "/dashboard/users/list" },
          { label: user.username },
        ],
        user: currentUser,
        targetUser: user,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error loading user details",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("users/:id/edit")
  async showEditUser(
    @Param("id") id: string,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }

    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      const user = await this.usersService.findById(parseInt(id));
      if (!user) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }

      return res.render("dashboard/users/edit", {
        layout: "layouts/dashboard",
        title: `Edit User - ${user.username}`,
        currentPage: "users",
        pageTitle: "Edit User",
        pageDescription: "Update user account information and permissions",
        breadcrumbs: [
          { label: "Users", url: "/dashboard/users" },
          { label: "All Users", url: "/dashboard/users/list" },
          { label: user.username, url: `/dashboard/users/${id}` },
          { label: "Edit" },
        ],
        user: currentUser,
        targetUser: user,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error loading user edit form",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("users/:id/edit")
  async updateUser(
    @Param("id") id: string,
    @Body() updateData: any,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }

    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      const user = await this.usersService.findById(parseInt(id));
      if (!user) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }

      // Update user properties
      if (updateData.username) user.username = updateData.username;
      if (updateData.role && currentUser.role === "admin")
        user.role = updateData.role;
      if (updateData.points !== undefined)
        user.points = parseInt(updateData.points);
      if (updateData.password) user.password = updateData.password;

      await this.usersService.userRepository.save(user);
      return res.redirect(`/dashboard/users/${id}`);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error updating user",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("certificates/list")
  async showCertificatesList(
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }

    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      const certificates = await this.certificatesService.getByType("all");
      const certificateStats =
        await this.analyticsService.getCertificateStats();

      return res.render("dashboard/certificates/list", {
        layout: "layouts/dashboard",
        title: "All Certificates",
        currentPage: "certificates",
        pageTitle: "All Certificates",
        pageDescription: "Manage and monitor SSL certificates",
        breadcrumbs: [
          { label: "Certificates", url: "/dashboard/certificates" },
          { label: "All Certificates" },
        ],
        user: currentUser,
        certificates,
        certificateStats,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error loading certificates list",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("certificates/:id")
  async showCertificate(
    @Param("id") id: string,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }

    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      const certificate = await this.certificatesService.verifyCertificate(id);
      if (!certificate) {
        throw new HttpException("Certificate not found", HttpStatus.NOT_FOUND);
      }

      return res.render("dashboard/certificates/view", {
        layout: "layouts/dashboard",
        title: `Certificate Details - ${certificate.name}`,
        currentPage: "certificates",
        pageTitle: "Certificate Details",
        pageDescription: "View and manage SSL certificate information",
        breadcrumbs: [
          { label: "Certificates", url: "/dashboard/certificates" },
          { label: "All Certificates", url: "/dashboard/certificates/list" },
          { label: certificate.name },
        ],
        user: currentUser,
        certificate,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error loading certificate details",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("audit")
  async showAuditLogs(
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }

    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      const recentLogs = await this.auditService.getRecentLogs(100);
      const stats = await this.auditService.getStats();

      return res.render("dashboard/audit", {
        layout: "layouts/dashboard",
        title: "Audit Logs",
        currentPage: "audit",
        pageTitle: "Audit Logs",
        pageDescription: "Monitor system activity and user actions",
        user: currentUser,
        recentLogs,
        stats,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error loading audit logs",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("subscriptions")
  async showSubscriptions(
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }

    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const subscriptions = await this.subscriptionsService.findAll();
      const monthlyRevenue =
        await this.subscriptionsService.calculateMonthlyRevenue();
      const activeSubscriptionsCount =
        await this.subscriptionsService.getActiveSubscriptions();
      const newSubscriptions =
        await this.subscriptionsService.totalSubscriptions(thirtyDaysAgo);
      const recentSubscriptions =
        await this.subscriptionsService.recentSubscriptions();
      const mostSubscribed =
        await this.subscriptionsService.getMostSubscribed(thirtyDaysAgo);

      const subscriptionStats = {
        activeSubscriptions: activeSubscriptionsCount,
        monthlyRevenue: monthlyRevenue,
        newSubscribers: newSubscriptions,
        churnRate: 2.1,
      };

      return res.render("dashboard/subscriptions-dashboard", {
        title: "Subscriptions",
        currentPage: "subscriptions",
        pageTitle: "Subscriptions",
        pageDescription: "Monitor subscription plans and user subscriptions",
        includeChartJS: false,
        additionalStyles: null,
        additionalScripts: null,
        pageScripts: null,
        user: currentUser,
        subscriptions,
        subscriptionStats,
        recentSubscriptions,
        mostSubscribed,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error loading subscriptions",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("settings")
  async showSettings(
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }

    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      return res.render("dashboard/settings-dashboard", {
        title: "System Settings",
        currentPage: "settings",
        pageTitle: "System Settings",
        pageDescription: "Configure system settings and preferences",
        includeChartJS: false,
        additionalStyles: null,
        additionalScripts: null,
        pageScripts: null,
        user: currentUser,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error loading settings",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("email")
  async showBulkEmail(
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }

    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      return res.render("dashboard/email-dashboard", {
        title: "Bulk Email",
        currentPage: "email",
        pageTitle: "Bulk Email",
        pageDescription: "Send bulk emails to users and subscribers",
        includeChartJS: false,
        additionalStyles: null,
        additionalScripts: null,
        pageScripts: null,
        user: currentUser,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error loading bulk email",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("transactions")
  async showTransactions(
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }

    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      const revenueStats = await this.analyticsService.getRevenueStats();
      const recentTransactions =
        await this.analyticsService.getRecentActivity();
      const chartData = await this.analyticsService.getRevenueChartData();

      // Filter only payment activities
      const transactions = recentTransactions.filter(
        (activity) => activity.type === "payment",
      );

      return res.render("dashboard/transactions", {
        layout: "layouts/dashboard",
        title: "Transactions",
        currentPage: "transactions",
        pageTitle: "Transactions",
        pageDescription: "Monitor revenue and payment activity",
        includeChartJS: true,
        user: currentUser,
        revenueStats,
        transactions,
        chartData,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error loading transactions",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("templates")
  async showTemplates(
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }
    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      const templates = await this.settingsService.findAll();
      return res.render("dashboard/templates-dashboard", {
        title: "Certificate Templates",
        currentPage: "templates",
        pageTitle: "Certificate Templates",
        pageDescription: "Manage certificate templates and configurations",
        includeChartJS: false,
        additionalStyles: null,
        additionalScripts: null,
        pageScripts: null,
        user: currentUser,
        templates,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error loading templates",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("templates/:id")
  async updateTemplate(
    @Session() session: Record<string, any>,
    @Param("id") id: string,
    @Body() templateData: any,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }
    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      await this.settingsService.update(Number(id), templateData);
      return res.redirect("/dashboard/templates");
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error updating template",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("subscriptions/list")
  async showSubscriptionsList(
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }
    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      const subscriptions = await this.subscriptionsService.findAll();
      return res.render("dashboard/subscriptions/list", {
        title: "All Subscriptions",
        currentPage: "subscriptions",
        pageTitle: "All Subscriptions",
        pageDescription: "Manage all subscription plans and user subscriptions",
        user: currentUser,
        subscriptions,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error loading subscriptions list",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("subscriptions/create")
  async showCreateSubscription(
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }
    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    return res.render("dashboard/subscriptions/create", {
      title: "Create Subscription",
      currentPage: "subscriptions",
      pageTitle: "Create New Subscription",
      pageDescription: "Create a new subscription plan",
      user: currentUser,
    });
  }

  @Post("subscriptions/create")
  async createSubscription(
    @Session() session: Record<string, any>,
    @Body() subscriptionData: any,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }
    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      await this.subscriptionsService.create(subscriptionData);
      return res.redirect("/dashboard/subscriptions");
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error creating subscription",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("subscriptions/:id")
  async showSubscription(
    @Session() session: Record<string, any>,
    @Param("id") id: string,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }
    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      const subscription = await this.subscriptionsService.findOne(Number(id));
      if (!subscription) {
        throw new HttpException("Subscription not found", HttpStatus.NOT_FOUND);
      }

      return res.render("dashboard/subscriptions/view", {
        title: `Subscription - ${subscription.name}`,
        currentPage: "subscriptions",
        pageTitle: "Subscription Details",
        pageDescription: `View details for ${subscription.name}`,
        user: currentUser,
        subscription,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error loading subscription details",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("subscriptions/:id/edit")
  async showEditSubscription(
    @Session() session: Record<string, any>,
    @Param("id") id: string,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }
    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      const subscription = await this.subscriptionsService.findOne(Number(id));
      if (!subscription) {
        throw new HttpException("Subscription not found", HttpStatus.NOT_FOUND);
      }

      return res.render("dashboard/subscriptions/edit", {
        title: `Edit Subscription - ${subscription.name}`,
        currentPage: "subscriptions",
        pageTitle: "Edit Subscription",
        pageDescription: `Edit ${subscription.name}`,
        user: currentUser,
        subscription,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error loading subscription for editing",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("subscriptions/:id/edit")
  async updateSubscription(
    @Session() session: Record<string, any>,
    @Param("id") id: string,
    @Body() subscriptionData: any,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }
    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      await this.subscriptionsService.update(Number(id), subscriptionData);
      return res.redirect(`/dashboard/subscriptions/${id}`);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error updating subscription",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete("subscriptions/:id")
  async deleteSubscription(
    @Session() session: Record<string, any>,
    @Param("id") id: string,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }
    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      await this.subscriptionsService.remove(Number(id));
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, error: "Failed to delete subscription" });
    }
  }

  @Get("subscriptions/export")
  async exportSubscriptions(
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const currentUser: User = session.user;
    if (!currentUser) {
      return res.redirect("/login");
    }
    if (currentUser.role !== "admin" && currentUser.role !== "moderator") {
      throw new HttpException("Unauthorized role", HttpStatus.FORBIDDEN);
    }

    try {
      const subscriptions = await this.subscriptionsService.findAll();
      const csvData = subscriptions.map((sub) => ({
        ID: sub.id,
        Name: sub.name,
        Price: sub.price,
        Points: sub.points,
        Purchased: sub.purchased,
        Created: sub.created_at,
      }));

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=subscriptions.csv",
      );

      const csvHeaders = Object.keys(csvData[0] || {}).join(",") + "\n";
      const csvRows = csvData
        .map((row) => Object.values(row).join(","))
        .join("\n");

      return res.send(csvHeaders + csvRows);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        "Error exporting subscriptions",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
