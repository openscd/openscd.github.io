# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.2](https://github.com/openscd/open-scd/compare/v0.0.1...v0.0.2) (2021-03-05)


### Features

* **logging:** add buttons to filter log messages by kind ([#136](https://github.com/openscd/open-scd/issues/136)) ([f354e1e](https://github.com/openscd/open-scd/commits/f354e1ea741179d3bdea06a486460269c3a202b2))
* add extension manager ([#124](https://github.com/openscd/open-scd/issues/124)) ([7264148](https://github.com/openscd/open-scd/commits/726414874d93ab894efc9c9360f3b47c5f5e694b))
* **defaults/template:** add all enumerations defined in 7-3 and 7-4 ([df27785](https://github.com/openscd/open-scd/commits/df27785fdea51011bede7c302670954f136ded47))
* **editors/templates:** add enum editor ([fe3887e](https://github.com/openscd/open-scd/commits/fe3887ef4b29999a7836de437e30990b442f10ac))
* **editors/templates:** add some default EnumTypes ([acad00b](https://github.com/openscd/open-scd/commits/acad00b9a4e57e81336a05c49de489e131057529))
* **editors/templates/enum:** add EnumVal editor ([a165df1](https://github.com/openscd/open-scd/commits/a165df13b874aaa9d371ece81b00c23ba13f796f))
* **editors/templates/enum:** add remove functionality ([bdd3962](https://github.com/openscd/open-scd/commits/bdd39620b0ff5946467ec11dbf24f627b582811d))
* **package:** add build task without tests ([00fb203](https://github.com/openscd/open-scd/commits/00fb20305a2ab6549077cc477c34bbe3339b0971))
* **package:** add manual test option ([d47e82e](https://github.com/openscd/open-scd/commits/d47e82e069feed4966dfc7c14d6468f6c5cf9a2e))
* **package:** allow manual browser choice in test:watch ([e9e61a4](https://github.com/openscd/open-scd/commits/e9e61a4c332861eca450557341b00664ae94984c))
* **package:** generate coverage during test:watch ([d7bfd08](https://github.com/openscd/open-scd/commits/d7bfd08720ca5847f76fc550addb183e008aa4f6))
* **scl-transformation:** automatic IEDName subscriber auto-complete ([#126](https://github.com/openscd/open-scd/issues/126)) ([9875644](https://github.com/openscd/open-scd/commits/9875644e123cd2af7cc35a0db9ce7fcd8e3af6d9))
* **wizarding:** update wizard-dialog on editor-action ([47d262c](https://github.com/openscd/open-scd/commits/47d262ce274eb3319e0ffbf520db158bbb60f342))


### Bug Fixes

* **editing:** fix empty array check ([5058052](https://github.com/openscd/open-scd/commits/505805252959dfa95e916d11a9e94e9a7f21b2eb))
* **editing:** stop logging failed actions ([611d29f](https://github.com/openscd/open-scd/commits/611d29f162e1af0ad3aa0094d1e4cc74a8e4e742))
* **editors/communication:** update to new WizardAction API ([300f9ac](https://github.com/openscd/open-scd/commits/300f9ac46e842d599274cea5ae1364098afd7d01))
* **editors/styling:** add abbrevaition style ([#138](https://github.com/openscd/open-scd/issues/138)) ([377f389](https://github.com/openscd/open-scd/commits/377f3894bd2b4a86ed9e68ec29a83bfdec678f93))
* **editors/subnetwork:** update to new WizardAction API ([9490129](https://github.com/openscd/open-scd/commits/949012900d4989356d9d6fac52edea2542a0c3ff))
* **editors/substation/conducting-equipment:** overlapping icon buttons ([#140](https://github.com/openscd/open-scd/issues/140)) ([1d2f301](https://github.com/openscd/open-scd/commits/1d2f30111f755203ff460d17dadfce7ee2f09974))
* **editors/templates:** add missing translations ([f005e1a](https://github.com/openscd/open-scd/commits/f005e1a38c4c88f4be08159a5f38605aa1387352))
* **editors/templates:** decouple foundation from substation editor ([6948d2c](https://github.com/openscd/open-scd/commits/6948d2cd38d00a5db9f78385442c4bfaac361db0))
* **editors/templates/enum:** add updateIDNamingAction to editor foundation ([3a30d86](https://github.com/openscd/open-scd/commits/3a30d8697e1cff47bff1ef3a4593ada6e83ef076))
* **editors/templates/enum:** fix names and translations ([3f54a72](https://github.com/openscd/open-scd/commits/3f54a72fe483ea92539300d2ca4b63597fb142e1))
* **editors/templates/enum-type:** remove debug logging statements ([fb09f73](https://github.com/openscd/open-scd/commits/fb09f73ab43bc78a83899105852686b9c85bff0b))
* **editors/templates/enum-val:** harden Actions against empty ord ([86c5de9](https://github.com/openscd/open-scd/commits/86c5de903c4a5ba95aa5551111aa2f27d55d2bda))
* **json/plugins:** correct SubscriberInfo plugin path ([c1ee2a0](https://github.com/openscd/open-scd/commits/c1ee2a0db51c9aa751e9deb5a86dd9985fbcc175))
* **lnodewizard:** client lns saved with empty string instead of Client LN ([#131](https://github.com/openscd/open-scd/issues/131)) ([85059ff](https://github.com/openscd/open-scd/commits/85059ff40e8dc81ffef8729d0fffd3c2efdb23b3))
* **logging:** do not log results of long running processes twice ([#137](https://github.com/openscd/open-scd/issues/137)) ([0239760](https://github.com/openscd/open-scd/commits/023976004cb8a86fe478c56550598d0b618fd55e))
* **open-scd:** move service worker registration to index.html ([1e1254f](https://github.com/openscd/open-scd/commits/1e1254fe1519fcb256da765e2254ab526673994c))
* **templates.scd:** remove superfluous standalone ([6ce1e42](https://github.com/openscd/open-scd/commits/6ce1e42749fb1c4c524e0db736ed51fbb8cd10dc))
* **translations:** add enum-editor translations ([b61648e](https://github.com/openscd/open-scd/commits/b61648ed4a20817dff5ada6b9bfcb7a03d2c090e))
* **validating:** remove karma testing hack ([c9c62b0](https://github.com/openscd/open-scd/commits/c9c62b03c1d667a72db6def083ca24c53fc7d780))
* **validating,schemas:** fix schema selection logic ([c9d4e2e](https://github.com/openscd/open-scd/commits/c9d4e2e0d5292dff051c3190d468402db8d80f6a))
* **wizard-dialog:** reset pageIndex on updated wizard ([2658c09](https://github.com/openscd/open-scd/commits/2658c09482219ac3daa0406eb6fa8a7b663b04ad))
* **wizard-dialog:** show new dialog on wizard change ([fdbe081](https://github.com/openscd/open-scd/commits/fdbe0810135a40320714b4a667330b45ddcb0e1e))

### 0.0.1 (2021-02-19)


### Features

* **logging:** add tooltip to make long string readable ([#85](https://github.com/openscd/open-scd/issues/85)) ([34ed4b4](https://github.com/openscd/open-scd/commits/34ed4b4e49b0cd0169b6c714a03a5b349fdd491f))
* **open-scd:** activate 'validate' button ([9e16d81](https://github.com/openscd/open-scd/commits/9e16d81c8d26c8528fa18b52d25a849aceefc51c))
* **open-scd:** add project handling including landing dialog ([5776cfa](https://github.com/openscd/open-scd/commits/5776cfad70296ad34df63acba29c94845700771f))
* **open-scd:** add project handling including landing dialog ([#73](https://github.com/openscd/open-scd/issues/73)) ([0c9a12b](https://github.com/openscd/open-scd/commits/0c9a12b09ac14f15dcb1ff000f64805540d1bab4)), closes [#74](https://github.com/openscd/open-scd/issues/74)
* **open-scd:** add save functionality ([#54](https://github.com/openscd/open-scd/issues/54)) ([bb9a967](https://github.com/openscd/open-scd/commits/bb9a967111a12e3ddba46af5fe3798f76f6e1bcd))
* **open-scd:** remove landing dialog around buttons ([#74](https://github.com/openscd/open-scd/issues/74)) ([628d825](https://github.com/openscd/open-scd/commits/628d82520d8799e72609c4d1ac910ac427d334cf))
* **schemas:** add schemas for editor1 and edition 2.1 ([#71](https://github.com/openscd/open-scd/issues/71)) ([0d6f2d3](https://github.com/openscd/open-scd/commits/0d6f2d325eed49ba7d3d1afd96736e9e31ab5898))
* **substation/editors:** add tooltip to header icon buttons ([#69](https://github.com/openscd/open-scd/issues/69)) ([bf7931c](https://github.com/openscd/open-scd/commits/bf7931c68cdad17136af1bac4835b04bf4aaacb9))


### Bug Fixes

* **conducting-equipment-editor:** center name the conducting equipment ([#63](https://github.com/openscd/open-scd/issues/63)) ([8fddba2](https://github.com/openscd/open-scd/commits/8fddba29d24b0aa6a7c9ab57430c649cf5e0863a))
* **conducting-equipment-editor:** type select field shows all choices ([#65](https://github.com/openscd/open-scd/issues/65)) ([1e2f04b](https://github.com/openscd/open-scd/commits/1e2f04bb7fb35d3685f0ccd86c5075f7c731bbb2))
* **editors/substation:** pass correct reference in Delete Action ([0540a93](https://github.com/openscd/open-scd/commits/0540a93b3f5b30e30f0088e3a4aa6a9f1a96d93f))
* **laclization:** fix spelling error in en.ts ([a666a6d](https://github.com/openscd/open-scd/commits/a666a6d75822791a7dc4f6f864fa0bbc39407050))
* **lnodewizard:** add info if no IEDs loaded to the project ([f6ba177](https://github.com/openscd/open-scd/commits/f6ba17763a1d33494399393455cf84e0b12c51fd))
* **open-scd:** adjust spacing and styling ([928de3c](https://github.com/openscd/open-scd/commits/928de3cb6d554af3d5f3019360f4c5bda68d8dfe))
* **open-scd:** fix radio list item alignment ([bb6b23d](https://github.com/openscd/open-scd/commits/bb6b23d9f228c7067cd5e7243dc2a4c09d446220))
* **open-scd:** improve start page layout ([3301dde](https://github.com/openscd/open-scd/commits/3301dde42b08b3daccec34cc5c5a4ea2ccf8fc70))
* **substaiton/editors:** delete tailingIcon from desc and name textfield ([#66](https://github.com/openscd/open-scd/issues/66)) ([8f48a85](https://github.com/openscd/open-scd/commits/8f48a8580d55f98c48936ebfc46b378ce613c2b5))
* **substation/editors:** desc textfield default empty string ([#64](https://github.com/openscd/open-scd/issues/64)) ([d5d2973](https://github.com/openscd/open-scd/commits/d5d297380d6a6a49364ea81d62f46d5ab0fb8f8a))
* **themes:** add list-item text colors ([#122](https://github.com/openscd/open-scd/issues/122)) ([fbcf6d3](https://github.com/openscd/open-scd/commits/fbcf6d3931f1ae031c06c466b1038645e72fab4c)), closes [#80](https://github.com/openscd/open-scd/issues/80)
* **wizard-textfield:** reset custom validity ([#48](https://github.com/openscd/open-scd/issues/48)) ([f6fdc48](https://github.com/openscd/open-scd/commits/f6fdc48079880abe294b1017f6def4e2a0eb065f))
