from django.db import migrations


def force_product_image_text(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return

    with schema_editor.connection.cursor() as cursor:
        cursor.execute("ALTER TABLE api_product ALTER COLUMN image TYPE text")


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0005_image_field_to_textfield"),
    ]

    operations = [
        migrations.RunPython(force_product_image_text, migrations.RunPython.noop),
    ]
