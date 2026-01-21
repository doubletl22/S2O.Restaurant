using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace S2O.Tenant.Infra.Migrations
{
    /// <inheritdoc />
    public partial class AddCapacityToTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Capacity",
                table: "Tables",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Capacity",
                table: "Tables");
        }
    }
}
