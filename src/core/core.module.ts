import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailService } from './services/email.service';
import { CloudinaryService } from './services/cloudinary.service';
import { TemplateService } from './services/template.service';
import { SequenceGeneratorService } from './services/sequence-generator.service';
import { PdfGenerationService } from './services/pdf-generation.service';
import { EmailProviderFactory } from './services/email/email-provider.factory';
import { MailtrapProvider } from './services/email/providers/mailtrap.provider';
import { GmailProvider } from './services/email/providers/gmail.provider';
import { ResendProvider } from './services/email/providers/resend.provider';
import {
  SequenceCounter,
  SequenceCounterSchema,
} from './entities/sequence-counter.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SequenceCounter.name, schema: SequenceCounterSchema },
    ]),
  ],
  providers: [
    EmailService,
    CloudinaryService,
    TemplateService,
    SequenceGeneratorService,
    PdfGenerationService,
    EmailProviderFactory,
    MailtrapProvider,
    GmailProvider,
    ResendProvider,
  ],
  exports: [
    EmailService,
    CloudinaryService,
    TemplateService,
    SequenceGeneratorService,
    PdfGenerationService,
  ],
})
export class CoreModule {}
