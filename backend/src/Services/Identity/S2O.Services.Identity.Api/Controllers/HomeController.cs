using Microsoft.AspNetCore.Mvc;

namespace S2O.Services.Identity.Api.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
