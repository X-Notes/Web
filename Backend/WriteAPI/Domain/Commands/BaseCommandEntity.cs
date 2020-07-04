using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands
{
    public abstract class BaseCommandEntity
    {
        public string Email { set; get; }
        public BaseCommandEntity(string Email)
        {
            this.Email = Email;
        }
        public BaseCommandEntity()
        {

        }
    }
}
