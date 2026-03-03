// Supabase Edge Function: Send Report Email Notifications
// Triggered when a new report is submitted to user_reports table
// Sends email to admin with all report details

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const ADMIN_EMAIL = "yangyang.ruohan.liu@gmail.com";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface ReportRecord {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  report_type: "user_behavior" | "message_content" | "activity_content";
  reason: string;
  description?: string;
  message_id?: string;
  chat_type?: "club" | "activity";
  activity_id?: string;
  created_at: string;
}

interface EmailPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
}

serve(async (req) => {
  try {
    // Parse the webhook payload
    const payload = await req.json();
    const report: ReportRecord = payload.record;

    console.log("Processing report:", report.id);

    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch reporter details
    const { data: reporter, error: reporterError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", report.reporter_id)
      .single();

    if (reporterError) {
      console.error("Error fetching reporter:", reporterError);
      throw new Error("Failed to fetch reporter details");
    }

    // Fetch reported user details
    const { data: reportedUser, error: reportedUserError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", report.reported_user_id)
      .single();

    if (reportedUserError) {
      console.error("Error fetching reported user:", reportedUserError);
      throw new Error("Failed to fetch reported user details");
    }

    // Build email content based on report type
    let emailContent = "";
    let emailSubject = "";

    if (report.report_type === "user_behavior") {
      emailSubject = `🚨 User Report: ${reportedUser.full_name}`;
      emailContent = buildUserBehaviorEmail(report, reporter, reportedUser);
    } else if (report.report_type === "message_content") {
      emailSubject = `🚨 Message Report: ${reportedUser.full_name}`;
      emailContent = await buildMessageReportEmail(
        report,
        reporter,
        reportedUser,
        supabase
      );
    } else if (report.report_type === "activity_content") {
      emailSubject = `🚨 Activity Report: ${reportedUser.full_name}`;
      emailContent = await buildActivityReportEmail(
        report,
        reporter,
        reportedUser,
        supabase
      );
    }

    // Send email via Resend
    const emailPayload: EmailPayload = {
      from: "Wildpals Reports <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      subject: emailSubject,
      html: emailContent,
    };

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Report email sent successfully",
        emailId: emailResult.id,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing report email:", error);

    // Log the error but don't fail the webhook
    // This ensures the report is still saved even if email fails
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: "Report saved but email notification failed",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200, // Return 200 to prevent webhook retries
      }
    );
  }
});

function buildUserBehaviorEmail(
  report: ReportRecord,
  reporter: any,
  reportedUser: any
): string {
  const dashboardLink = `${SUPABASE_URL}/project/_/auth/users`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .section { margin-bottom: 20px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">🚨 New User Behavior Report</h2>
        </div>
        <div class="content">
          <div class="section">
            <div class="label">Report ID:</div>
            <div class="value">${report.id}</div>
          </div>

          <div class="section">
            <div class="label">Reporter:</div>
            <div class="value">
              <strong>${reporter.full_name}</strong><br>
              Email: ${reporter.email}<br>
              ID: ${report.reporter_id}
            </div>
          </div>

          <div class="section">
            <div class="label">Reported User:</div>
            <div class="value">
              <strong>${reportedUser.full_name}</strong><br>
              Email: ${reportedUser.email}<br>
              ID: ${report.reported_user_id}
            </div>
          </div>

          <div class="section">
            <div class="label">Reason:</div>
            <div class="value">${formatReason(report.reason)}</div>
          </div>

          ${
            report.description
              ? `
          <div class="section">
            <div class="label">Additional Details:</div>
            <div class="value">${escapeHtml(report.description)}</div>
          </div>
          `
              : ""
          }

          <div class="section">
            <div class="label">Reported At:</div>
            <div class="value">${new Date(report.created_at).toLocaleString()}</div>
          </div>

          <a href="${dashboardLink}" class="button">View in Supabase Dashboard</a>
        </div>
        <div class="footer">
          This is an automated notification from Wildpals reporting system.
        </div>
      </div>
    </body>
    </html>
  `;
}

async function buildMessageReportEmail(
  report: ReportRecord,
  reporter: any,
  reportedUser: any,
  supabase: any
): Promise<string> {
  const dashboardLink = `${SUPABASE_URL}/project/_/auth/users`;

  // Fetch the message content
  let messageContent = "Unable to fetch message content";
  let messageTimestamp = "";

  if (report.message_id) {
    const { data: message, error } = await supabase
      .from("chat_messages")
      .select("message, created_at, sender_id")
      .eq("id", report.message_id)
      .single();

    if (!error && message) {
      messageContent = message.message;
      messageTimestamp = new Date(message.created_at).toLocaleString();
    }
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .section { margin-bottom: 20px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; }
        .message-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 10px 0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">🚨 New Message Report</h2>
        </div>
        <div class="content">
          <div class="section">
            <div class="label">Report ID:</div>
            <div class="value">${report.id}</div>
          </div>

          <div class="section">
            <div class="label">Reporter:</div>
            <div class="value">
              <strong>${reporter.full_name}</strong><br>
              Email: ${reporter.email}<br>
              ID: ${report.reporter_id}
            </div>
          </div>

          <div class="section">
            <div class="label">Reported User:</div>
            <div class="value">
              <strong>${reportedUser.full_name}</strong><br>
              Email: ${reportedUser.email}<br>
              ID: ${report.reported_user_id}
            </div>
          </div>

          <div class="section">
            <div class="label">Chat Type:</div>
            <div class="value">${report.chat_type === "club" ? "Club Chat" : "Activity Chat"}</div>
          </div>

          <div class="section">
            <div class="label">Reported Message:</div>
            <div class="message-box">
              "${escapeHtml(messageContent)}"
              <br><small>Sent at: ${messageTimestamp}</small>
            </div>
          </div>

          <div class="section">
            <div class="label">Reason:</div>
            <div class="value">${formatReason(report.reason)}</div>
          </div>

          ${
            report.description
              ? `
          <div class="section">
            <div class="label">Additional Details:</div>
            <div class="value">${escapeHtml(report.description)}</div>
          </div>
          `
              : ""
          }

          <div class="section">
            <div class="label">Reported At:</div>
            <div class="value">${new Date(report.created_at).toLocaleString()}</div>
          </div>

          <a href="${dashboardLink}" class="button">View in Supabase Dashboard</a>
        </div>
        <div class="footer">
          This is an automated notification from Wildpals reporting system.
        </div>
      </div>
    </body>
    </html>
  `;
}

async function buildActivityReportEmail(
  report: ReportRecord,
  reporter: any,
  reportedUser: any,
  supabase: any
): Promise<string> {
  const dashboardLink = `${SUPABASE_URL}/project/_/auth/users`;

  // Fetch the activity details
  let activityTitle = "Unable to fetch activity";
  let activityDescription = "";
  let activityLocation = "";
  let activityDate = "";

  if (report.activity_id) {
    const { data: activity, error } = await supabase
      .from("activities")
      .select("title, special_comments, location, date, time, type")
      .eq("id", report.activity_id)
      .single();

    if (!error && activity) {
      activityTitle = activity.title;
      activityDescription = activity.special_comments || "No description";
      activityLocation = activity.location;
      activityDate = `${activity.date} at ${activity.time}`;
    }
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .section { margin-bottom: 20px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; }
        .activity-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 10px 0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">🚨 New Activity Report</h2>
        </div>
        <div class="content">
          <div class="section">
            <div class="label">Report ID:</div>
            <div class="value">${report.id}</div>
          </div>

          <div class="section">
            <div class="label">Reporter:</div>
            <div class="value">
              <strong>${reporter.full_name}</strong><br>
              Email: ${reporter.email}<br>
              ID: ${report.reporter_id}
            </div>
          </div>

          <div class="section">
            <div class="label">Reported User (Activity Organizer):</div>
            <div class="value">
              <strong>${reportedUser.full_name}</strong><br>
              Email: ${reportedUser.email}<br>
              ID: ${report.reported_user_id}
            </div>
          </div>

          <div class="section">
            <div class="label">Reported Activity:</div>
            <div class="activity-box">
              <strong>${escapeHtml(activityTitle)}</strong><br>
              <small>📍 ${escapeHtml(activityLocation)}</small><br>
              <small>📅 ${activityDate}</small><br>
              <br>
              ${escapeHtml(activityDescription)}
            </div>
          </div>

          <div class="section">
            <div class="label">Reason:</div>
            <div class="value">${formatReason(report.reason)}</div>
          </div>

          ${
            report.description
              ? `
          <div class="section">
            <div class="label">Additional Details:</div>
            <div class="value">${escapeHtml(report.description)}</div>
          </div>
          `
              : ""
          }

          <div class="section">
            <div class="label">Reported At:</div>
            <div class="value">${new Date(report.created_at).toLocaleString()}</div>
          </div>

          <a href="${dashboardLink}" class="button">View in Supabase Dashboard</a>
        </div>
        <div class="footer">
          This is an automated notification from Wildpals reporting system.
        </div>
      </div>
    </body>
    </html>
  `;
}

function formatReason(reason: string): string {
  const reasonMap: Record<string, string> = {
    harassment: "Harassment or bullying",
    spam: "Spam or unwanted content",
    inappropriate_content: "Inappropriate content",
    fake_profile: "Fake or impersonation",
    hate_speech: "Hate speech",
    dangerous_activity: "Dangerous or unsafe activity",
    misleading_information: "Misleading information",
    other: "Other",
  };

  return reasonMap[reason] || reason;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
}
