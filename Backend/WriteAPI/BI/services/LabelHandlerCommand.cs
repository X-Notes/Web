using System;
using System.Collections.Generic;
using System.Text;
using WriteContext.Repositories;

namespace BI.services
{
    public class LabelHandlerCommand
    {
        private readonly LabelRepository labelRepository;
        public LabelHandlerCommand(LabelRepository labelRepository)
        {
            this.labelRepository = labelRepository;
        }
    }
}
