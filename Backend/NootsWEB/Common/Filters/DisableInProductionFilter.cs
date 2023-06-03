using Common.App;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;

namespace Common.Filters;

public class DisableInProductionFilter : Attribute, IActionFilter
{
    private readonly ControllersActiveConfig controllersActiveConfig;

    public DisableInProductionFilter(ControllersActiveConfig controllersActiveConfig)
    {
        this.controllersActiveConfig = controllersActiveConfig;
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
    }

    public void OnActionExecuting(ActionExecutingContext context)
    {
        if (!controllersActiveConfig.FakeData)
        {
            context.Result = new NotFoundResult();
        }
    }
}
