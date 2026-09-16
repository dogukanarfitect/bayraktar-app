# iOS güncelleme kuralı

Karar yalnızca kurulu uygulamanın `Application.nativeApplicationVersion`
(`CFBundleShortVersionString`) değeri üzerinden verilir. Build numarası okunmaz.
Sürümler `major.minor.patch` biçiminde olmalıdır: `1.0.0`, `1.0.1`, `1.10.0`.
Parçalar sayısal karşılaştırılır; ön sürüm ekleri (`-beta`) kabul edilmez.

Firebase Remote Config parametresi: `update_policy_ios_test`.
Canlı yayına geçerken `constants.ts` içindeki parametreyi `update_policy_ios_prod`
olarak değiştirip App Store bağlantısını içeren kuralı yayınlayın.

## İsteğe bağlı güncelleme örneği

```json
{
  "enabled": true,
  "latestVersion": "1.0.1",
  "minimumSupportedVersion": "1.0.0",
  "forceUpdateEnabled": false,
  "optionalUpdateEnabled": true,
  "storeUrl": "https://testflight.apple.com/join/GERCEK_TESTFLIGHT_KODU",
  "title": "Yeni sürüm hazır",
  "message": "Uygulamanın yeni sürümünü yükleyebilirsin."
}
```

Bağlantıyı gerçek TestFlight bağlantısıyla değiştirin. Zorunlu güncelleme için
`minimumSupportedVersion` değerini `1.0.1`, `forceUpdateEnabled` değerini `true`
yapın. Minimum sürüm, güncel sürümden büyük olamaz. `title` ve `message`
isteğe bağlıdır. Kontrolü kapatmak için `{"enabled": false}` yayınlamak yeterlidir.

## Eski build kuralından geçiş

Firebase'deki `latestBuild` ve `minimumSupportedBuild` alanlarını kaldırıp
`latestVersion` ve `minimumSupportedVersion` alanlarını kullanın. Etkin bir
kuralda iki sürüm alanı da zorunludur. Eski build alanlarından sürüm türetilmez.
Yeni kodu içeren bir native uygulama paketi kurulmalıdır; önceki paketlerin
karşılaştırma mantığı Firebase ayarıyla değişmez.

Son geçerli kural cihazda hem parametre adına hem de sürüm şemasına göre ayrı
saklanır. Eski build tabanlı kayıt yeni kontrol için kullanılmaz. Geçersiz kural
veya bağlantı hatasında son geçerli sürüm kuralı korunur; kayıt yoksa uygulama açılır.

## TestFlight doğrulaması

1. `enabled: false` ile `1.0.0` sürümünü kurun.
2. Version değerini `1.0.1` yaparak ikinci paketi yayınlayın; test telefonunda
   `1.0.0` kalsın. Xcode ile arşivliyorsanız native Version değerini de doğrulayın.
3. İkinci sürüm erişilebilir olunca yukarıdaki kuralı Firebase'de yayınlayın.
4. `1.0.0` sürümünde isteğe bağlı uyarıyı, ardından zorunlu kuralı deneyin.
5. `1.0.1` kurulduğunda ekranın kalktığını doğrulayın; yalnızca build artırmak yetmez.

`Daha sonra` aynı hedef sürüm için oturum boyunca hatırlanır; zorunlu kararı
engellemez. Uygulama açılışta, gerçek zamanlı Firebase değişikliklerinde ve en az
15 dakika arka planda kaldıktan sonra geri dönüldüğünde kontrol yapar.

Yerel kontroller: `npm run typecheck` ve `npm run verify:update-policy`.
