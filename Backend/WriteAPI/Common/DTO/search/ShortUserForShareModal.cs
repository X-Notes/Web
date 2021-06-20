using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DTO.search
{
    public class ShortUserForShareModal
    {
        public Guid Id { set; get; }
        public string Name { set; get; }
        public string Email { set; get; }
        public Guid PhotoId { set; get; }
        public string PhotoPath { set; get; }
    }
}
