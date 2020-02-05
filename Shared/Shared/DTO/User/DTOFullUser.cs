using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.DTO.User
{
    public class DTOFullUser
    {
        public string Name { set; get; }
        public string Email { set; get; }
        public string PhotoId { set; get; }
        public List<DTOBackground> BackgroundsId { set; get; }
        public DTOBackground CurrentBackgroundId { set; get; }
    }
}
