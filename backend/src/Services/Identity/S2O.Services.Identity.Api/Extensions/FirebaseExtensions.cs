using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;

public static class FirebaseExtensions
{
    public static void AddFirebase(this IServiceCollection services)
    {
        FirebaseApp.Create(new AppOptions
        {
            Credential = GoogleCredential.FromFile("firebase-adminsdk.json")
        });
    }
}
