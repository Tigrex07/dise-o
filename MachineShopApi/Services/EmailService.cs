using MailKit.Net.Smtp;
using MimeKit;

namespace EmailService;

public class EmailSettings
{
    public string SmtpServer { get; set; } = string.Empty;
    public int Port { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public bool UseSsl { get; set; } = true;
}

public class EmailService
{
    private readonly EmailSettings _settings;

    public EmailService(EmailSettings settings)
    {
        _settings = settings;
    }

    public async Task SendEmailAsync(List<string> recipients, string subject, string body)
    {
        var message = new MimeMessage();
        
        // Remitente
        message.From.Add(new MailboxAddress(_settings.DisplayName, _settings.Email));
        
        // Destinatarios
        foreach (var recipient in recipients)
        {
            message.To.Add(MailboxAddress.Parse(recipient));
        }
        
        // Asunto y contenido
        message.Subject = subject;
        message.Body = new TextPart("plain") { Text = body };

        // Enviar
        using var client = new SmtpClient();
        
        await client.ConnectAsync(_settings.SmtpServer, _settings.Port, _settings.UseSsl);
        await client.AuthenticateAsync(_settings.Email, _settings.Password);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}