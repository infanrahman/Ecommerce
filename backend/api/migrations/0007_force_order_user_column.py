from django.db import migrations


def force_order_user_column(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return

    with schema_editor.connection.cursor() as cursor:
        cursor.execute("ALTER TABLE api_order ADD COLUMN IF NOT EXISTS user_id bigint NULL")
        cursor.execute(
            "CREATE INDEX IF NOT EXISTS api_order_user_id_idx ON api_order (user_id)"
        )


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0006_force_product_image_text"),
    ]

    operations = [
        migrations.RunPython(force_order_user_column, migrations.RunPython.noop),
    ]
