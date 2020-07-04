using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using WriteContext.helpers;

namespace Domain.Commands.users
{
    public class UpdateLanguage : IRequest<Unit>
    {
        public Language Language { set; get; }
        public string Email { set; get; }

        public UpdateLanguage(Language Language, string Email)
        {
            this.Language = Language;
            this.Email = Email;
        }
    }
}
