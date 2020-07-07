using Common.DTO.labels;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries.labels
{
    public class GetLabelsByEmail : IRequest<List<LabelDTO>>
    {
        public string Email { set; get; }
        public GetLabelsByEmail(string Email)
        {
            this.Email = Email;
        }
    }
}
