using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace S2O.Tenant.Infra.Persistence.Migrations
{
    public partial class AddTenantLockAuditFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LockedAtUtc",
                table: "Tenants",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LockedUntilUtc",
                table: "Tenants",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LockReason",
                table: "Tenants",
                type: "text",
                maxLength: 500,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LockedAtUtc",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "LockedUntilUtc",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "LockReason",
                table: "Tenants");
        }
    }
}
