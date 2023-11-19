using Common.ConstraintsUploadFiles;
using Common.DTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace Common;

public static class ControllerExtensions
{
    public static string GetUserIdRaw(this ControllerBase controller)
    {
        return controller.User.Claims.FirstOrDefault(x => x.Type.Contains(ConstClaims.UserId))?.Value;
    }

    public static Guid GetUserId(this ControllerBase controller)
    {
        var id = controller.User.Claims.FirstOrDefault(x => x.Type.Contains(ConstClaims.UserId))?.Value;
        return Guid.Parse(id);
    }

    public static bool IsValidUserId(this ClaimsPrincipal user)
    {
        var id = user.Claims.FirstOrDefault(x => x.Type.Contains(ConstClaims.UserId))?.Value;
        if (id != null)
        {
            return Guid.TryParse(id, out var res);
        }
        return false;
    }

    public static Guid GetUserIdUnStrict(this ControllerBase controller)
    {
        var id = controller.User.Claims.FirstOrDefault(x => x.Type.Contains(ConstClaims.UserId))?.Value;
        return string.IsNullOrEmpty(id) ? Guid.Empty : Guid.Parse(id);
    }

    public static OperationResult<T> ValidateFile<T>(
        this ControllerBase controller,
        IFormFile file,
        List<string> contentTypes,
        long? maximumAllowableFileSize = null)
    {
        var size = maximumAllowableFileSize.HasValue ? maximumAllowableFileSize.Value : FileSizeConstraints.MaxRequestFileSize;
        if (file.Length > size)
        {
            return new OperationResult<T>().SetFileSizeTooLarge();
        }

        if (!contentTypes.Contains(file.ContentType))
        {
            return new OperationResult<T>().SetNoSupportExtension();
        }

        return new OperationResult<T>(success: true, default);
    }

}
