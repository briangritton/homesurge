# Making Phone Numbers Clickable in EmailJS Templates

This guide explains how to make phone numbers clickable in your EmailJS templates, which is especially useful for SMS-to-email services like Verizon's vtext.

## HTML Telephone Links

To make a phone number clickable, use the HTML `tel:` protocol in an anchor tag:

```html
<a href="tel:{{lead_phone}}">{{lead_phone}}</a>
```

This creates a clickable link that, when tapped on a mobile device, will prompt the user to call the number.

## Example Implementation

Here's an example of how to format your EmailJS template with clickable phone numbers:

```html
<h2>New Lead Notification</h2>

<p><strong>Name:</strong> {{lead_name}}</p>
<p><strong>Phone:</strong> <a href="tel:{{lead_phone}}">{{lead_phone}}</a></p>
<p><strong>Address:</strong> {{lead_address}}</p>
<p><strong>Source:</strong> {{lead_source}}</p>
<p><strong>Submitted:</strong> {{submission_time}}</p>

<p><a href="{{crm_link}}">View lead in CRM</a></p>
```

## Formatting Phone Numbers

For the best user experience, phone numbers should be properly formatted:

1. **EmailJS Template**: The template will display the phone number exactly as received from your code.

2. **vText and SMS Gateways**: When the email is converted to SMS, HTML is usually stripped, but the phone number will still be visible.

3. **Email Client Support**: Most modern email clients will recognize phone numbers and make them clickable automatically, but the `tel:` link ensures consistent behavior.

## Enhanced Usability for Mobile Users

For sales representatives using mobile devices, clickable phone numbers provide several benefits:

1. **One-Tap Calling**: Directly call leads without having to manually dial or copy/paste numbers
2. **Reduced Errors**: Eliminates potential for misdialing
3. **Faster Response**: Enables immediate response to new leads

## Implementation Instructions

To implement clickable phone numbers in your email templates:

1. Log into your [EmailJS dashboard](https://dashboard.emailjs.com/templates)
2. Select your template (ID: `template_kuv08p4`)
3. Edit the HTML content to include the `tel:` link (see example above)
4. Save your template

The changes will take effect immediately for all new notifications sent through the system.

## Additional Tips

- If you're seeing formatting issues with phone numbers, ensure they're consistently formatted in your system.
- For international numbers, including the country code (+1 for US) in the href improves compatibility.
- Consider adding a small phone icon (📞) before the number to make it more obvious it's clickable.
- Test the template by sending it to various devices and email clients to ensure proper functionality.

By implementing clickable phone numbers, you'll significantly improve the user experience for your sales team, especially those who receive lead notifications on mobile devices.