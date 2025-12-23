using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastucture.Migrations
{
    /// <inheritdoc />
    public partial class addcompanytopaymentorder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PaymentOrder_Orders_OrderId",
                table: "PaymentOrder");

            migrationBuilder.DropForeignKey(
                name: "FK_PaymentOrder_Payments_PaymentId",
                table: "PaymentOrder");

            migrationBuilder.AlterColumn<DateTime>(
                name: "PaymentDate",
                table: "Payments",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<Guid>(
                name: "CompanyId",
                table: "PaymentOrder",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentOrder_CompanyId_DateCreated",
                table: "PaymentOrder",
                columns: new[] { "CompanyId", "DateCreated" });

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentOrder_Companies_CompanyId",
                table: "PaymentOrder",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentOrder_Orders_OrderId",
                table: "PaymentOrder",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentOrder_Payments_PaymentId",
                table: "PaymentOrder",
                column: "PaymentId",
                principalTable: "Payments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PaymentOrder_Companies_CompanyId",
                table: "PaymentOrder");

            migrationBuilder.DropForeignKey(
                name: "FK_PaymentOrder_Orders_OrderId",
                table: "PaymentOrder");

            migrationBuilder.DropForeignKey(
                name: "FK_PaymentOrder_Payments_PaymentId",
                table: "PaymentOrder");

            migrationBuilder.DropIndex(
                name: "IX_PaymentOrder_CompanyId_DateCreated",
                table: "PaymentOrder");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "PaymentOrder");

            migrationBuilder.AlterColumn<DateTime>(
                name: "PaymentDate",
                table: "Payments",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentOrder_Orders_OrderId",
                table: "PaymentOrder",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentOrder_Payments_PaymentId",
                table: "PaymentOrder",
                column: "PaymentId",
                principalTable: "Payments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
