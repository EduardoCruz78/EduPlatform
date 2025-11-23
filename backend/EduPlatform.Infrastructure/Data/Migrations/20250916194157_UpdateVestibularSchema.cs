using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduPlatform.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateVestibularSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Date",
                table: "Vestibulares");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Vestibulares");

            migrationBuilder.DropColumn(
                name: "Url",
                table: "Vestibulares");

            migrationBuilder.DropColumn(
                name: "OriginalTopicId",
                table: "VestibularContents");

            migrationBuilder.AddColumn<bool>(
                name: "IsShared",
                table: "VestibularContents",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsShared",
                table: "VestibularContents");

            migrationBuilder.AddColumn<string>(
                name: "Date",
                table: "Vestibulares",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Vestibulares",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Url",
                table: "Vestibulares",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OriginalTopicId",
                table: "VestibularContents",
                type: "integer",
                nullable: true);
        }
    }
}
