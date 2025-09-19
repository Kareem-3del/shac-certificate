import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  action: string;

  @Column({ type: "varchar", length: 100 })
  entity: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  entityId?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  userId?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  userEmail?: string;

  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  userAgent?: string;

  @Column({ type: "text", nullable: true })
  details?: string;

  @Column({ type: "json", nullable: true })
  oldValues?: any;

  @Column({ type: "json", nullable: true })
  newValues?: any;

  @Column({ type: "varchar", length: 50, default: "info" })
  severity: "info" | "warning" | "error" | "critical";

  @Column({ type: "varchar", length: 100, nullable: true })
  module?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
