import { DomSanitizer } from '@angular/platform-browser';

import { Routes } from '@angular/router'
import { AdministrationComponent } from './administration/administration.component'
import { AccountingComponent } from './accounting/accounting.component'
import { AboutComponent } from './about/about.component'
import { AddressSelectComponent } from './address-select/address-select.component'
import { SavedAddressComponent } from './saved-address/saved-address.component'
import { AddressCreateComponent } from './address-create/address-create.component'
import { DeliveryMethodComponent } from './delivery-method/delivery-method.component'
import { DeluxeUserComponent } from './deluxe-user/deluxe-user.component'
import { SavedPaymentMethodsComponent } from './saved-payment-methods/saved-payment-methods.component'
import { BasketComponent } from './basket/basket.component'
import { OrderCompletionComponent } from './order-completion/order-completion.component'
import { ContactComponent } from './contact/contact.component'
import { PhotoWallComponent } from './photo-wall/photo-wall.component'
import { ComplaintComponent } from './complaint/complaint.component'
import { ChatbotComponent } from './chatbot/chatbot.component'
import { OrderSummaryComponent } from './order-summary/order-summary.component'
import { OrderHistoryComponent } from './order-history/order-history.component'
import { PaymentComponent } from './payment/payment.component'
import { WalletComponent } from './wallet/wallet.component'
import { LoginComponent } from './login/login.component'
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component'
import { RecycleComponent } from './recycle/recycle.component'
import { RegisterComponent } from './register/register.component'
import { SearchResultComponent } from './search-result/search-result.component'
import { ScoreBoardComponent } from './score-board/score-board.component'
import { TrackResultComponent } from './track-result/track-result.component'
import { TwoFactorAuthEnterComponent } from './two-factor-auth-enter/two-factor-auth-enter.component'
import { PrivacySecurityComponent } from './privacy-security/privacy-security.component'
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component'
import { ChangePasswordComponent } from './change-password/change-password.component'
import { TwoFactorAuthComponent } from './two-factor-auth/two-factor-auth.component'
import { DataExportComponent } from './data-export/data-export.component'
import { LastLoginIpComponent } from './last-login-ip/last-login-ip.component'
import { NFTUnlockComponent } from './nft-unlock/nft-unlock.component'
import { OAuthComponent } from './oauth/oauth.component'
import { TokenSaleComponent } from './token-sale/token-sale.component'
import { ErrorPageComponent } from './error-page/error-page.component'
import { AdminGuard } from './admin.guard'
import { LoginGuard } from './login.guard'
import { AccountingGuard } from './accounting.guard'
import { oauthMatcher } from './oauth.matcher'
import { tokenMatcher } from './token.matcher'
import { loadWeb3WalletModule } from './web3-wallet/web3-wallet.module'
import { loadWeb3SandboxModule } from './web3-sandbox/web3-sandbox.module'
import { loadFaucetModule } from './bee-haven/faucet.module'

const routes: Routes = [
  {
    path: atob('YWRtaW5pc3RyYXRpb24='),
    component: AdministrationComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'accounting',
    component: AccountingComponent,
    canActivate: [AccountingGuard]
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'address/select',
    component: AddressSelectComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'address/saved',
    component: SavedAddressComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'address/create',
    component: AddressCreateComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'address/edit/:addressId',
    component: AddressCreateComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'delivery-method',
    component: DeliveryMethodComponent
  },
  {
    path: 'deluxe-membership',
    component: DeluxeUserComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'saved-payment-methods',
    component: SavedPaymentMethodsComponent
  },
  {
    path: 'basket',
    component: BasketComponent
  },
  {
    path: 'order-completion/:id',
    component: OrderCompletionComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: 'photo-wall',
    component: PhotoWallComponent
  },
  {
    path: 'complain',
    component: ComplaintComponent
  },
  {
    path: 'chatbot',
    component: ChatbotComponent
  },
  {
    path: 'order-summary',
    component: OrderSummaryComponent
  },
  {
    path: 'order-history',
    component: OrderHistoryComponent
  },
  {
    path: 'payment/:entity',
    component: PaymentComponent
  },
  {
    path: 'wallet',
    component: WalletComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'recycle',
    component: RecycleComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'search',
    component: SearchResultComponent
  },
  {
    path: 'hacking-instructor',
    component: SearchResultComponent
  },
  {
    path: 'score-board',
    component: ScoreBoardComponent
  },
  {
    path: 'track-result',
    component: TrackResultComponent
  },
  {
    path: 'track-result/new',
    component: TrackResultComponent,
    data: {
      type: 'new'
    }
  },
  {
    path: '2fa/enter',
    component: TwoFactorAuthEnterComponent
  },
  {
    path: 'privacy-security',
    component: PrivacySecurityComponent,
    children: [
      {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent
      },
      {
        path: 'two-factor-authentication',
        component: TwoFactorAuthComponent
      },
      {
        path: 'data-export',
        component: DataExportComponent
      },
      {
        path: 'last-login-ip',
        component: LastLoginIpComponent
      }
    ]
  },
  {
    path: 'juicy-nft',
    component: NFTUnlockComponent
  },
  {
    path: 'wallet-web3',
    loadChildren: async () => await loadWeb3WalletModule()
  },
  {
    path: 'web3-sandbox',
    loadChildren: async () => await loadWeb3SandboxModule()
  },
  {
    path: 'bee-haven',
    loadChildren: async () => await loadFaucetModule()
  },
  {
    matcher: oauthMatcher,
    data: {
      params: (() => {
        const url = window.location.href;
        return encodeURIComponent(url.substring(url.indexOf('#'))); // Sanitize URL
      })()
    },
    component: OAuthComponent
  },
  {
    matcher: tokenMatcher,
    component: TokenSaleComponent
  },
  {
    path: '403',
    component: ErrorPageComponent
  },
  {
    path: '**',
    component: SearchResultComponent
  }
]

export { routes }