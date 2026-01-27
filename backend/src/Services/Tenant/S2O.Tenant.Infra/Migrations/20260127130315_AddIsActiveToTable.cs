using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace S2O.Tenant.Infra.Migrations
{
    /// <inheritdoc />
    public partial class AddIsActiveToTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Tables",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Tables");
        }
    }
}
