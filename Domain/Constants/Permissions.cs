namespace Domain.Constants
{
    public static class Permissions
    {
        public const string Companies = "Companies";
        public const string Companies_View = "Companies.View";
        public const string Companies_Create = "Companies.Create";
        public const string Companies_Update = "Companies.Update";
        public const string Companies_Delete = "Companies.Delete";

        public const string Partners = "Partners";
        public const string Partners_View = "Partners.View";
        public const string Partners_Create = "Partners.Create";
        public const string Partners_Update = "Partners.Update";
        public const string Partners_Delete = "Partners.Delete";

        public const string Services = "Services";
        public const string Services_View = "Services.View";
        public const string Services_Create = "Services.Create";
        public const string Services_Update = "Services.Update";
        public const string Services_Delete = "Services.Delete";

        public const string Orders = "Orders";
        public const string Orders_View = "Orders.View";
        public const string Orders_Create = "Orders.Create";
        public const string Orders_Update = "Orders.Update";
        public const string Orders_Delete = "Orders.Delete";

        public const string Payments = "Payments";
        public const string Payments_View = "Payments.View";
        public const string Payments_Create = "Payments.Create";
        public const string Payments_Update = "Payments.Update";
        public const string Payments_Delete = "Payments.Delete";

        public static string[] GetAll()
        {
            return new[]
            {
                Companies_View, Companies_Create, Companies_Update, Companies_Delete,
                Partners_View, Partners_Create, Partners_Update, Partners_Delete,
                Services_View, Services_Create, Services_Update, Services_Delete,
                Orders_View, Orders_Create, Orders_Update, Orders_Delete,
                Payments_View, Payments_Create, Payments_Update, Payments_Delete
            };
        }
    }
}

