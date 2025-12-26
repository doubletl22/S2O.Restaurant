using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace S2O.Services.Identity.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UserAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "IsActive", "PasswordHash", "TenantId", "UserName" },
                values: new object[] { new Guid("dbe0ce4e-c1e0-4e9c-a91f-68a30ec58428"), new DateTime(2025, 12, 25, 17, 55, 3, 256, DateTimeKind.Utc).AddTicks(805), "vinh@gmail.com", true, "432005", new Guid("fcf137bd-2967-4242-bfd3-55dd3a1d42c3"), "" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("dbe0ce4e-c1e0-4e9c-a91f-68a30ec58428"));
        }
    }
}
