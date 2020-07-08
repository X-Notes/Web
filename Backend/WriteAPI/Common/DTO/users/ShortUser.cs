using System;
using System.Collections.Generic;
using System.Text;
using WriteContext.helpers;

namespace Common.DTO.users
{
    public class ShortUser
    {
        public string Name { set; get; }
        public string Email { set; get; }
        public string PhotoId { set; get; }
        public string BackgroundId { set; get; }
        public Language Language { set; get; }
    }
}
