using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using WriteContext.helpers;

namespace Domain.Commands.users
{
    public class UpdateLanguageCommand : BaseCommandEntity, IRequest<Unit>
    {
        public Language Language { set; get; }

        public UpdateLanguageCommand(Language Language, string Email)
            :base(Email)
        {
            this.Language = Language;
        }
    }
}
