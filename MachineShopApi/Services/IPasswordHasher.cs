// Services/IPasswordHasher.cs
namespace MachineShopApi.Services
{
	public interface IPasswordHasher
	{
		// Define el método para generar el hash de una contraseña
		string HashPassword(string password);

		// Define el método para verificar una contraseña (necesario para el Login)
		bool VerifyPassword(string providedPassword, string hash);
	}
}