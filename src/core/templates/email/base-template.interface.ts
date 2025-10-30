export interface BaseEmailTemplate {
  subject: string;
  html: string;
}

export interface EmailTemplateData {
  [key: string]: any;
}

export interface EmailTemplateFunction<
  T extends EmailTemplateData = EmailTemplateData,
> {
  (data: T): BaseEmailTemplate;
}

// Company branding data
export interface CompanyBranding {
  website: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
}

// Base template structure
export interface BaseTemplateStructure {
  header: string;
  content: string;
  footer: string;
}

// Default company branding
export const DEFAULT_COMPANY_BRANDING: CompanyBranding = {
  website: '',
  contactInfo: {
    email: '',
    phone: '',
    address: '',
  },
};
