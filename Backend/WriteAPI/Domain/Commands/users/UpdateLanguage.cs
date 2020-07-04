using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using WriteContext.helpers;

namespace Domain.Commands.users
{
    public class UpdateLanguage : BaseCommandEntity, IRequest<Unit>
    {
        public Language Language { set; get; }

        public UpdateLanguage(Language Language, string Email)
            :base(Email)
        {
            this.Language = Language;
        }
    }
}
