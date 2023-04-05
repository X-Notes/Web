using Common.DatabaseModels.Models.Notes;
using Common.DTO.WebSockets;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Noots.SignalrUpdater.Impl;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WriteAPI.Controllers.WS
{
    [Route("api/[controller]")]
    [ApiController]
    public class WSManagementController : ControllerBase
    {
        private readonly AppSignalRService appSignalRService;

        public WSManagementController(AppSignalRService appSignalRService)
        {
            this.appSignalRService = appSignalRService;
        }


        [HttpPost("connections")]
        public async Task HandleDeadConnections(List<DeadConnectionDTO> connections)
        {
            foreach(var con in connections)
            {
                if(con.NoteIds != null)
                {
                    foreach(var noteId in con.NoteIds)
                    {
                        await appSignalRService.RemoveOnlineUsersNoteAsync(noteId, con.UserIdentifierConnectionId, con.UserId);
                    }
                }
                if (con.FolderIds != null)
                {
                    foreach (var folderId in con.FolderIds)
                    {
                        await appSignalRService.RemoveOnlineUsersFolderAsync(folderId, con.UserIdentifierConnectionId, con.UserId);
                    }
                }
            }
        }
    }
}
