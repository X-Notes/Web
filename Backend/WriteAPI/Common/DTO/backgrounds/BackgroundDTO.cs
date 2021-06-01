using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DTO.backgrounds
{
    public class BackgroundDTO
    {
        public Guid Id { set; get; }
        public Guid PhotoId { set; get; }
        public string PhotoPath { set; get; }
    }
}
