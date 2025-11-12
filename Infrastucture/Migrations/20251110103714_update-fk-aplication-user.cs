using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastucture.Migrations
{
    /// <inheritdoc />
    public partial class updatefkaplicationuser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Partners_AspNetUsers_UserId1",
                table: "Partners");

            migrationBuilder.DropIndex(
                name: "IX_Partners_UserId1",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "Partners");

            migrationBuilder.AddColumn<string>(
                name: "DisplayName",
                table: "Partners",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "SequenceNumber",
                table: "Partners",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SequencePrefix",
                table: "Partners",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsUserRoot",
                table: "AspNetUsers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "PartnerId",
                table: "AspNetUsers",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_PartnerId",
                table: "AspNetUsers",
                column: "PartnerId",
                unique: true,
                filter: "[PartnerId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_Partners_PartnerId",
                table: "AspNetUsers",
                column: "PartnerId",
                principalTable: "Partners",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Partners_PartnerId",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_PartnerId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "DisplayName",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "SequenceNumber",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "SequencePrefix",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "IsUserRoot",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "PartnerId",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId1",
                table: "Partners",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Partners_UserId1",
                table: "Partners",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Partners_AspNetUsers_UserId1",
                table: "Partners",
                column: "UserId1",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
