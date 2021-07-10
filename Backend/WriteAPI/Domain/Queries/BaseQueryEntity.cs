using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries
{
    public class BaseQueryEntity
    {
        public string Email { set; get; }
        public BaseQueryEntity(string Email)
        {
            this.Email = Email;
        }
        public BaseQueryEntity()
        {

        }
    }
}
