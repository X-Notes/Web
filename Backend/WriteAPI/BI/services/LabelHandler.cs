using System;
using System.Collections.Generic;
using System.Text;
using WriteContext.Repositories;

namespace BI.services
{
    public class LabelHandler
    {
        private readonly LabelRepository labelRepository;
        public LabelHandler(LabelRepository labelRepository)
        {
            this.labelRepository = labelRepository;
        }
    }
}
