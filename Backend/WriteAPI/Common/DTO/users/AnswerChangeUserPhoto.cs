using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO.users
{
    public class AnswerChangeUserPhoto
    {
        public bool Success { set; get; }
        public Guid Id { set; get; }
        public string PhotoPath { set; get; }
    }
}
