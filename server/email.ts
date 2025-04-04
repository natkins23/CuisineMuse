import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY environment variable is not set');
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface RecipeEmailData {
  recipientEmail: string;
  recipe: {
    title: string;
    description?: string;
    ingredients?: string;
    instructions?: string;
    mealType?: string;
    prepTime?: number;
    servings?: number;
  };
}

export async function sendTestEmail(email: string, name?: string): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    console.log('Attempting to send test email via Resend to:', email);

    const { data, error } = await resend.emails.send({
      from: 'CuisineMuse <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to CuisineMuse – Let\'s get cooking 🍳',
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto;">
          <h1 style="color: #ff6f61;">Welcome to CuisineMuse!</h1>
          <p>Thanks for signing up.</p>

          <p>Your account is ready — you can now start creating recipes powered by AI, personalized to your taste, schedule, and what's already in your kitchen.</p>

          <hr style="border: none; border-top: 1px solid #eee;" />

          <ul>
            <li>✨ Ask for meals in plain English</li>
            <li>📋 Get clear, easy-to-follow instructions</li>
            <li>🌍 Explore global flavors without the stress</li>
          </ul>

          <p>Let's make cooking feel creative, not chaotic.</p>

          <p style="margin-top: 2em;">– The CuisineMuse Team</p>

          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 0.8em; color: #888;">This message confirms your new CuisineMuse account.</p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    console.log('Test email sent successfully with Resend:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
}

export async function sendNewsletterEmail(email: string): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    console.log('Attempting to send newsletter welcome email via Resend to:', email);

    const { data, error } = await resend.emails.send({
      from: 'CuisineMuse <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to the Flavor Feed 🥘',
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto;">
          <h1 style="color: #ff6f61;">You're in! Welcome to <em>The Flavor Feed</em> 🥘</h1>

          <p>Thanks for joining CuisineMuse's weekly recipe inspiration newsletter.</p>

          <p><strong>The Flavor Feed</strong> is your go-to for fresh, AI-powered cooking ideas — simple meals made smarter, one delicious email at a time.</p>

          <hr style="border: none; border-top: 1px solid #eee;" />

          <p>We'll keep things quick, tasty, and tailored to real life. Because cooking should be exciting — not exhausting.</p>

          <p style="margin-top: 2em;">Stay inspired,<br /><strong>The CuisineMuse Team</strong></p>

          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 0.8em; color: #888;">You're receiving this message because you signed up for The Flavor Feed newsletter from CuisineMuse.</p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending newsletter email:', error);
      return false;
    }

    console.log('Newsletter welcome email sent successfully with Resend:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending newsletter email:', error);
    return false;
  }
}

export async function sendRecipeEmail(data: RecipeEmailData): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { recipe, recipientEmail } = data;

    const ingredientsList = recipe.ingredients?.split('\n').map(i => `<li>${i.trim()}</li>`).join('\n') || '';
    const instructionsList = recipe.instructions?.split('\n').map(i => `<li>${i.trim()}</li>`).join('\n') || '';

    const { data: responseData, error } = await resend.emails.send({
      from: 'CuisineMuse <onboarding@resend.dev>',
      to: recipientEmail,
      subject: `Your Recipe: ${recipe.title} 🍳`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333;">
          <h1 style="color: #ff6f61;">${recipe.title}</h1>

          ${recipe.description ? `<p style="font-style: italic;">${recipe.description}</p>` : ''}

          <div style="margin: 20px 0; color: #666;">
            ${recipe.prepTime ? `<span>⏱️ ${recipe.prepTime} minutes</span>` : ''}
            ${recipe.servings ? `<span style="margin-left: 15px;">👥 Serves ${recipe.servings}</span>` : ''}
            ${recipe.mealType ? `<span style="margin-left: 15px;">🍽️ ${recipe.mealType}</span>` : ''}
          </div>

          <h2 style="color: #2c3e50;">Ingredients</h2>
          <ul style="list-style-type: none; padding-left: 0;">
            ${ingredientsList}
          </ul>

          <h2 style="color: #2c3e50;">Instructions</h2>
          <ol style="padding-left: 20px;">
            ${instructionsList}
          </ol>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #888; font-size: 0.9em;">Recipe generated by CuisineMuse AI</p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending recipe email:', error);
      return false;
    }

    console.log('Recipe email sent successfully:', responseData?.id);
    return true;
  } catch (error) {
    console.error('Error sending recipe email:', error);
    return false;
  }
}