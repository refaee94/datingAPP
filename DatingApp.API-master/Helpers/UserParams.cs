namespace DatingApp.API.Helpers
{
    public class UserParams
    {
        
        public const int DEFUALT_MIN_AGE = 18;
        public const int DEFUALT_MAX_AGE = 99;
        private int MaxPageSize = 50;
        private int MinPageSize = 5;
        public int PageNumber { get; set; } = 1;
        private int pageSize = 10;
        public int PageSize
        {
            get { return pageSize;}
            set { pageSize = (value > MaxPageSize) ? MaxPageSize : (value < MinPageSize) ? MinPageSize : value;}
        }

        public int UserId { get; set; }
        public string Gender { get; set; }

        public int MinAge { get; set; } = DEFUALT_MIN_AGE;
        public int MaxAge { get; set; } = DEFUALT_MAX_AGE;

        public string OrderBy { get; set; }

        public bool Likees { get; set; } = false;

        public bool Likers { get; set; } = false;
        
    }
}