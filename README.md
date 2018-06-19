# Big Brotter Internal Tool

| Beschrijving | Commando |
| ------------ | -------- |
| Server private & public keys aanmaken (naar /out map) | `node . genServerKeys` |
| Server /out map leegmaken | `node . cleanOutDir` |
| User aanmaken zonder tussenvoegsel | `node . registerCustomer BSN VOORNAAM ACHTERNAAM` |
| User aanmaken met tussenvoegsel | `node . registerCustomer BSN VOORNAAM TUSSENVOEGSEL ACHTERNAAM` |
| Certificaat van een user controleren | `node . verifySignature SIGNATURE` |
