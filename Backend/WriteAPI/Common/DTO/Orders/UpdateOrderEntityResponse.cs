using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO.Orders
{
    public class UpdateOrderEntityResponse
    {
        public Guid EntityId { set; get; }

        public int NewOrder { set; get; }
    }
}
